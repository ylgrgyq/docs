# 关系向导
数据对象之间存在3种类型的关系。一对一关系可以将一个对象与另一个对象关联。一对多关系可以使一个对象关联多个对象。多对多关系可以实现大量对象之间的复杂关系。

## LeanCloud中的关系
LeanCloud中有4种方式构建对象之间的关系：

1. Pointers （适合一对一和一对多关系）
2. Arrays （适合一对多和多对多关系）
3. AVRelation （适合多对多关系）
4. 关联表 （适合多对多关系）

## 一对多关系
当你需要一个一对多关系的时候，该使用 Pointers 还是 Arrays 实现，需要考虑几个因素。首先，需要考虑关系中包含的对象数量。如果关系的“多”方包含的对象数量可能非常大（大于100左右），那么你就必须使用 Pointers。反之，如果对象数量很小（低于100或更少），那么 Arrays 可能会更方便，特别是如果你经常需要获取父对象同时得到所有相关的对象（在“一个一对多的关系”的“多”）。

### 使用 Pointers 实现一对多关系
假如我们有一个游戏程序，需要记录玩家每次游戏的分数和成就。我们可以构造一个`Game`对象来存储这些数据。如果这个游戏运营得非常成功，每个玩家将拥有成千上万的`Game`对象。类似这样的情况，关系中的对象数量可能无限制地增长，Pointer 是最好的选择。
假设在这个游戏应用中，我们确定每个`Game`对象都会与一个 AVUser 关联。我们可以像这样实现：

```objc
AVObject *game= [AVObject objectWithClassName:@"Game"];
[game setObject:[AVUser currentUser] forKey:@"createdBy"];
```

我们可以使用下面的代码来查询某个 AVUser 创建的`Game`对象：

```objc
AVQuery *gameQuery = [AVQuery queryWithClassName:@"Game"];
[gameQuery whereKey:@"createdBy" equalTo:[AVUser currentUser]];
```

如果我们需要查询某个`Game`对象的创建者，也就是获取 `createdBy` 属性：

```objc
// say we have a Game object
AVObject *game = ...
 
// getting the user who created the Game
AVUser *createdBy = [game objectForKey@"createdBy"];
```

大多数场景下，Pointers 是实现一对多关系的最好选择。

### 使用 Arrays 实现一对多关系
当我们知道一对多关系中包含的对象数量很小时，使用 Arrays 实现是比较理想的。Arrays 可以通过 `includeKey` 简化查询。传递对应的 key 可以在获取“一”方对象数据的同时获取到所有“多”方对象的数据。但是，如果关系中包含的对象数量巨大，查询将响应缓慢。

假设在我们的游戏中，玩家需要保存角色游戏过程中积累的所有武器，且总共有几十种武器。在这个实例中我们知道武器的数量不会变得很大。同时，我们还想允许玩家设定武器的顺序。这种情况正好适合用 Arrays 实现，因为数组的大小不会很大，而且还需要保存玩家每次游戏后数组内元素的顺序：

我们可以在 AVUser 上创建添加一列`weaponsList`。

现在我们存入一些`Weapon`对象到`weaponsList`中：

```objc
// let's say we have four weapons
AVObject *scimitar = ...
AVObject *plasmaRifle = ...
AVObject *grenade = ...
AVObject *bunnyRabbit = ...
 
// stick the objects in an array
NSArray *weapons = @[scimitar, plasmaRifle, grenade, bunnyRabbit];
 
// store the weapons for the user
[[AVUser currentUser] setObject:weapons forKey:@weaponsList"];
```

然后，如果我们需要获取这些`Weapon`对象，仅仅需要一行代码：

```objc
NSArray *weapons = [[AVUser currentUser] objectForKey:@"weaponsList"];
```

有时候，我们会想获取我们一对多中“一”的对象的同时获取“多”的对象。我们可以在使用 AVQuery 查询 AVUser 的时候，使用`includeKey`（或 Android 中的`include`）来同时获取`weaponsList`列中存放的`Weapon`对象：

```objc
// set up our query for a User object
AVQuery *userQuery = [AVUser query];
 
// configure any constraints on your query...
// for example, you may want users who are also playing with or against you
 
// tell the query to fetch all of the Weapon objects along with the user
// get the "many" at the same time that you're getting the "one"
[userQuery includeKey:@"weaponsList"];
 
// execute the query
[userQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
    // objects contains all of the User objects, and their associated Weapon objects, too
}];
```

你也可以在一对多关系中通过“多”方对象获取到“一”方对象。例如，我们想找出所有拥有某个特定`Weapon`的 AVUser，可以像这样来查询：

```objc
// add a constraint to query for whenever a specific Weapon is in an array
[userQuery whereKey:@"weaponsList" equalTo:scimitar];
 
// or query using an array of Weapon objects...
[userQuery whereKey:@"weaponsList" containedIn:arrayOfWeapons];
```

## 多对多关系

### 使用 AVRelation

### 使用关联表

### 使用 Arrays 实现多对多关系

## 一对一关系
当你需要将一个对象拆分成两个对象时，一对一关系是一种重要的需求。这种需求应该很少见，但是在下面的实例中体现了这样的需求：

* **限制部分用户数据的可见性** 在这个场景中，你可以将此对象拆分成两部分，一部分包含所有其他用户可见的数据，另一部分包含所有仅自己可见的数据（通过ACL控制）。
* **避免大对象** 在这个场景中，你的原始对象大小大于了对象的上限值（128K），你可以创建另一个对象来存储额外的数据。当然，这通常需要更好地设计你的数据模型来避免出现大对象。如果确实无法避免，你也可以考虑使用AVFile存储大数据。
* **更灵活的文件对象** AVFile 可以方便的存取文件，但是作为对象查询修改等不是很方便，可以使用 AVObject 构造一个自己的文件对象并与 AVFile 一对一关联，将文件属性存于AVObject 中，这样既可以方便查询修改文件属性，也可以方便存取文件。

感谢您阅读此文档。对于实现的复杂性我们深感抱歉。通常，数据的关系建模是一个难题。但是我们可以看到光明的一面：它仍然比人际关系简单。