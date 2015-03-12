# iOS / OS X 指南

如果还没有安装 LeanCloud iOS SDK，请阅读 [快速入门](/start.html) 来获得该 SDK，并在 Xcode 中运行和熟悉示例代码。我们的 SDK 支持 iOS 4.3 及更高版本。

如果想从项目中学习，请到我们的 GitHub 资源库中获取 [iOS SDK Demos](https://github.com/leancloud/iOS-SDK-demos) 。

## 介绍

LeanCloud 是一个完整的平台解决方案，它为应用开发提供了全方位的后端服务。我们的目标是让开发者不需要进行后端开发及服务器运维等工作，就可以开发和发布成熟的应用。

如果熟悉像 Ruby on Rails 这样的 Web 框架，你会发现 LeanCloud 很容易上手。我们在设计 LeanCloud 时应用了许多与之相同的原则。如果你之前使用过 Parse 或类似的后端服务，那么还会发现我们的 API 尽可能与其保持兼容。我们这样设计，是为了让开发者可以轻而易举地将应用从其他服务迁移至 LeanCloud，并且能得心应手地使用我们的 SDK 进行开发。

## 快速入门

建议在阅读本文之前，先阅读 [快速入门](/start.html)，了解如何配置和使用 LeanCloud。

## 使用 CocoaPods 安装 SDK

[快速入门](https://leancloud.cn/start.html) 会教你如何在一个项目中安装 SDK。

[CocoaPods](http://www.cocoapods.org/) 是一款很好的依赖管理工具，其安装步骤大致如下：

* 首先确保开发环境中已经安装了 Ruby（一般安装了 XCode，Ruby 会被自动安装上）
* 我们建议使用淘宝提供的 [Gem源](http://ruby.taobao.org/)，在终端执行下列命令：

  ```sh
  $ gem sources --remove https://rubygems.org/
  $ gem sources -a http://ruby.taobao.org/
  # 请确保下列命令的输出只有 ruby.taobao.org
  $ gem sources -l
  *** CURRENT SOURCES ***
  http://ruby.taobao.org
  ```

* 通过下列命令，安装（或更新）CocoaPods（可能需要输入登录密码）：

  ```sh
  sudo gem install cocoapods
  ```

* 在项目根目录下创建一个名为 `Podfile` 的文件（无扩展名），并添加以下内容：

  ```sh
  pod 'AVOSCloud'
  ```
* 如果使用 SNS 组件（社交平台服务）的相关功能，则添加：

  ```sh
  pod 'AVOSCloudSNS'
  ```

* 执行命令 `pod install` 安装 SDK。

相关资料：《[CocoaPods 安装和使用教程](http://code4app.com/article/cocoapods-install-usage)》

## 应用

部署在 LeanCloud 上的每个应用都有自己的 ID 和客户端密钥，客户端代码应该使用它们来初始化 SDK。

LeanCloud 的每一个帐户都可以创建多个应用。同一个应用可分别在测试环境和生产环境部署不同的版本。

## 对象

### AVObject

在 LeanCloud 上，数据存储是围绕 `AVObject` 进行的。每个 `AVObject` 都包含与 JSON 相兼容的键值对（key-value）数据。该数据不需要定义模式（schema），因此不用提前指定 `AVObject` 都有哪些键，只要直接设定键值对即可。

例如，记录游戏玩家的分数，直接创建一个独立的 `AVObject` 即可 ：

```objc
score: 1337, playerName: "Steve", cheatMode: false
```

键，必须是由字母、数字或下划线组成的字符串；自定义的键，不能以 `__`（双下划线）开头。值，可以是字符串、数字、布尔值，或是数组和字典。

**注意：在 iOS SDK 中，`code`、 `uuid`、 `className`、  `keyValues`、 `fetchWhenSave`、 `running`、 `acl`、 `ACL`、 `isDataReady`、 `pendingKeys`、 `createdAt`、 `updatedAt`、 `objectId`、 `description` 都是保留字段，不能作为键来使用。**

每个 `AVObject` 都必须有一个类（Class）名称，以便区分不同类型的数据。例如，游戏分数这个对象可取名为 `GameScore`。

我们建议将类和键分别按照 `NameYourClassesLikeThis` 和 `nameYourKeysLikeThis` 这样的惯例来命名，即区分第一个字母的大小写，这样可以提高代码的可读性和可维护性。

### 保存对象

接下来，需要将上文中的 `GameScore` 存储到 LeanCloud 上。LeanCloud 的相关接口和 `NSMutableDictionary` 类似，但只有在调用 `save` 方法时，数据才会被真正保存下来。

```objc
AVObject *gameScore = [AVObject objectWithClassName:@"GameScore"];
[gameScore setObject:[NSNumber numberWithInt:1337] forKey:@"score"];
[gameScore setObject:@"Steve" forKey:@"playerName"];
[gameScore setObject:[NSNumber numberWithBool:NO] forKey:@"cheatMode"];
[gameScore save];
```

运行此代码后，要想确认保存动作是否已经生效，可以到 LeanCloud 应用管理平台的 [数据管理](/data.html?appid={{appid}}) 页面来查看数据的存储情况。

如果保存成功，`GameScore` 的数据列表应该显示出以下记录：

```objc
objectId: "51a90302e4b0d034f61623b5", score: 1337, playerName: "Steve", cheatMode: false,
createdAt:"2013-06-01T04:07:30.32Z", updatedAt:"2013-06-01T04:07:30.32Z"
```

在此要特别说明两点：

1. 运行此代码前，不用配置或设置 `GameScore` 类，LeanCloud 会自动创建这个类。
2. 为更方便地使用 LeanCloud，以下字段不需要提前指定：
  * `objectId` 是为每个对象自动生成的唯一的标识符
  * `createdAt` 和 `updatedAt` 分别代表每个对象在 LeanCloud 中创建和最后修改的时间，它们会被自动赋值。

  在执行保存操作之前，这些字段不会被自动保存到 `AVObject` 中。

### 检索对象

将数据保存到 LeanCloud 上实现起来简单而直观，获取数据也是如此。如果已知 `objectId`，用 `AVQuery` 就可以得到对应的 `AVObject` ：

```objc
AVQuery *query = [AVQuery queryWithClassName:@"GameScore"];
AVObject *gameScore = [query getObjectWithId:@"51a90302e4b0d034f61623b5"];
```

用 `objectForKey` 获取属性值：

```objc
int score = [[gameScore objectForKey:@"score"] intValue];
NSString *playerName = [gameScore objectForKey:@"playerName"];
BOOL cheatMode = [[gameScore objectForKey:@"cheatMode"] boolValue];
```

获取三个特殊属性：

```objc
NSString *objectId = gameScore.objectId;
NSDate *updatedAt = gameScore.updatedAt;
NSDate *createdAt = gameScore.createdAt;
```

如果需要刷新特定对象的最新数据，可调用 `refresh` 方法 ：

```objc
[myObject refresh];
```

### 后台运行

在 iOS 或 OS X 中，大部分代码是在主线程中运行的。不过，当应用在主线程中访问网络时，可能常会发生卡顿或崩溃现象。

由于 `save` 和 `getObjectWithId` 这两个方法会访问网络，所以不应当在主线程上运行。这种情况一般处理起来比较麻烦，因此，LeanCloud 提供了辅助方法，能够覆盖绝大多数应用场景。

例如，方法 `saveInBackground` 可在后台线程中保存之前的 `AVObject`：

```objc
[gameScore saveInBackground];
```

这样，`saveInBackground` 的调用会立即返回，而主线程不会被阻塞，应用会保持在响应状态。

通常情况下，要在某操作完成后立即运行后面的代码，可以使用 Block（`...WithBlock` ：仅支持 iOS 4.0+ 或 OS X 10.6+）或回调（`...CallBack`）方法。

例如，在保存完成后运行一些代码：

```objc
[gameScore saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
  if (!error) {
    // gameScore 保存成功
  } else {
    // 保存 gameScore 时出错
  }
}];
```

或者写成回调方式：

```objc
// 先创建一个回调
- (void)saveCallback:(NSNumber *)result error:(NSError *)error {
  if (!error) {
    // gameScore 保存成功
  } else {
    // 保存 gameScore 时出错
  }
}

// 然后在后续代码中执行其他操作
[gameScore saveInBackgroundWithTarget:self
                             selector:@selector(saveCallback:error:)];
```

LeanCloud 在进行网络通讯时不会阻塞调用线程，Block 或回调会在主线程执行。也就是说，网络访问不会对 UI 产生不良影响，在回调中可对 UI 进行操作。

`AVQuery` 也遵循相同的模式。如果需要从对象 `GameScore` 获取并保存得分，同时又确保主线程不会被阻塞，则可以：

```objc
AVQuery *query = [AVQuery queryWithClassName:@"GameScore"];
[query getObjectInBackgroundWithId:@"51a90302e4b0d034f61623b5"
                             block:^(AVObject *gameScore, NSError *error) {
  if (!error) {
    // get 请求成功完成，输出分数
    NSLog(@"The score was: %d", [[gameScore objectForKey:@"score"] intValue]);
  } else {
    // 请求失败，输出错误信息
    NSLog(@"Error: %@ %@", error, [error userInfo]);
  }
}];
```

或用回调方式：

```objc
// 先创建一个回调
- (void)getCallback:(AVObject *)gameScore error:(NSError *)error {
  if (!error) {
    // get 请求成功完成，输出分数
    NSLog(@"The score was: %d", [[gameScore objectForKey:@"score"] intValue]);
  } else {
    // 请求失败，输出错误信息
    NSLog(@"Error: %@ %@", error, [error userInfo]);
  }
}

// 然后在后续代码中执行其他操作
AVQuery *query = [AVQuery queryWithClassName:@"GameScore"];
[query getObjectInBackgroundWithId:@"51a90302e4b0d034f61623b5"
                            target:self
                          selector:@selector(getCallback:error:)];
```

###离线存储对象

大多数保存功能可以立刻执行，并通知应用「保存完毕」。不过若不需要知道保存完成的时间，则可使用 `saveEventually` 来代替。

它的优点在于：如果用户目前尚未接入网络，`saveEventually` 会保存设备中的数据，并在网络连接恢复后上传。如果应用在网络恢复之前就被关闭了，那么当它下一次打开时，LeanCloud 会再次尝试连接。

所有 `saveEventually`（或 `deleteEventually`）的相关调用，将按照调用的顺序依次执行。因此，多次对某一对象使用 `saveEventually` 是安全的。

```objc
// 创建对象
AVObject *gameScore = [AVObject objectWithClassName:@"GameScore"];
[gameScore setObject:[NSNumber numberWithInt:1337] forKey:@"score"];
[gameScore setObject:@"Sean Plott" forKey:@"playerName"];
[gameScore setObject:[NSNumber numberWithBool:NO] forKey:@"cheatMode"];
[gameScore setObject:[NSArray arrayWithObjects:@"pwnage", @"flying", nil] forKey:@"skills"];
[gameScore saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {

    [gameScore setObject:[NSNumber numberWithBool:YES] forKey:@"cheatMode"];
    [gameScore setObject:[NSNumber numberWithInt:1338] forKey:@"score"];
    [gameScore saveEventually];
}];
```

### 更新对象

更新对象非常简单，仅需要更新其属性，再调用保存方法即可。例如：

```objc
// 创建对象
AVObject *gameScore = [AVObject objectWithClassName:@"GameScore"];
[gameScore setObject:[NSNumber numberWithInt:1337] forKey:@"score"];
[gameScore setObject:@"Steve" forKey:@"playerName"];
[gameScore setObject:[NSNumber numberWithBool:NO] forKey:@"cheatMode"];
[gameScore setObject:[NSArray arrayWithObjects:@"pwnage", @"flying", nil] forKey:@"skills"];
[gameScore saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {

    // 增加些新数据，这次只更新 cheatMode 和 score
    // playerName 不变，然后保存到云端
    [gameScore setObject:[NSNumber numberWithBool:YES] forKey:@"cheatMode"];
    [gameScore setObject:[NSNumber numberWithInt:1338] forKey:@"score"];
    [gameScore saveInBackground];
}];
```

客户端会自动计算出哪些数据已经改变，并将修改过的的字段发送给 LeanCloud。未更新的数据不会产生变动，这一点请不用担心。

### 计数器

上面是一个常见的使用案例。在下面例子中，`score` 字段是一个计数器，我们需要不断更新玩家的最新得分。使用上述方法后，这个计数器运行良好，但如果有多个客户端试图更新同一个计数器，上面的方法就十分繁琐并且容易出现问题。

为了优化计数器类的数据存储，LeanCloud 为所有的数字型字段都提供了「原子递增（或递减）」方法，故相同的更新可以改写为：

```objc
[gameScore incrementKey:@"score"];
[gameScore saveInBackground];
```

也可以使用 `incrementKey:byAmount:` 来累加字段的数值。

那有没有方法，可以不用特意去做 `fetch`，就能马上得到计数器当前在后端的最新数据呢？LeanCloud 提供了 
`fetchWhenSave` 属性，当设置为 `true` 时，LeanCloud 会在保存操作发生时，自动返回当前计数器的最新数值。


### 数组

为了更好地存储数组数据，LeanCloud 提供了三种不同的操作来自动更新数组字段：

* `addObject:forKey:` 和 `addObjectsFromArray:forKey:`
  将指定对象附加到数组末尾。
* `addUniqueObject:forKey:` 和 `addUniqueObjectsFromArray:forKey:`
  如果不确定某个对象是否已包含在数组字段中，可以使用此操作来添加。对象的插入位置是随机的。
* `removeObject:forKey:` 和 `removeObjectsInArray:forKey:`
  从数组字段中删除指定对象的所有实例。

例如，将对象添加到 `skills` 字段：

```objc
[gameScore addUniqueObjectsFromArray:[NSArray arrayWithObjects:@"flying", @"kungfu", nil] forKey:@"skills"];
[gameScore saveInBackground];
```

###删除对象

从 LeanCloud 中删除一个对象：

```objc
[myObject deleteInBackground];
```

如果想通过回调来确认删除操作，可以使用方法 `deleteInBackgroundWithBlock:` 或 `deleteInBackgroundWithTarget:selector:`。如果想强制在当前线程执行，使用 `delete`。

`removeObjectForKey:` 方法会删除对象的单个属性。

```objc
// After this, playerName field will be empty
[myObject removeObjectForKey:@"playerName"];

// 字段删除后结果保存到云端
[myObject saveInBackground];
```



### 关系型数据

对象可以与其他对象建立「关系」。为了模拟这种行为，任何 `AVObject` 均可作为另一个 `AVObject` 的属性，在其他 `AVObjects` 中使用。在内部，LeanCloud 框架会将引用到的对象储存到同一个地方，以保持一致性。

「关系」最主要的特性在于它能很容易地进行动态扩展（相对于数组而言），同时又具备很好的查询能力。数组在查询上的功能比较有限，而且使用起来并不容易。数组和关系都可以用来存储「一对多」的映射。

例如，在一个博客应用中，一条评论（comment）对应一篇文章（post）。下面的代码将创建一篇有一条评论的文章：

```objc
// 创建文章、标题和内容
AVObject *myPost = [AVObject objectWithClassName:@"Post"];
[myPost setObject:@"I'm Smith" forKey:@"title"];
[myPost setObject:@"Where should we go for lunch?" forKey:@"content"];

// 创建评论和内容
AVObject *myComment = [AVObject objectWithClassName:@"Comment"];
[myComment setObject:@"Let's do Sushirrito." forKey:@"content"];

// 为文章和评论建立一对一关系
[myComment setObject:myPost forKey:@"parent"];

// 同时保存 myPost、myComment
[myComment saveInBackground];
```

还可以只用 `objectID` 来关联对象：

```objc
// 把评论跟 objectId 为 "51a902d3e4b0d034f6162367" 的文章关联起来
[myComment setObject:[AVObject objectWithoutDataWithClassName:@"Post" objectId:@"51a902d3e4b0d034f6162367"]
              forKey:@"parent"];
```

默认情况下，在获取一个对象时，与其相关联的 `AVObject` 不会被一同获取。因此，这些关联对象的属性只有在重新获取之后才能使用。例如：

```objc
// 取回父级文章对象
AVObject *post = [fetchedComment objectForKey:@"parent"];
// 获取 post 的相关属性
[post fetchIfNeededInBackgroundWithBlock:^(AVObject *object, NSError *error) {
  // 取回文章标题
  NSString *title = [post objectForKey:@"title"];
}];
```

`AVRelation` 对象可以用来模拟「多对多」的关系，它的工作原理类似于 `AVObject` 中的 `NSArray`。二者的不同之处在于，你不需要即时下载关系中的所有对象。这意味着，使用 `AVRelation` 可以扩展出比 `AVObject` 中的 `NSArray` 更多的对象。

例如，一个用户喜欢多篇文章，就可以用 `relationforKey:` 来保存这些文章。将一篇文章按顺序添加到列表，可这样做：

```objc
AVUser *user = [AVUser currentUser];
AVRelation *relation = [user relationforKey:@"likes"];
[relation addObject:post];
[user saveInBackground];
```

从 `AVRelation` 中移除一篇喜欢的文章：

```objc
[relation removeObject:post];
```

默认情况下，这个关系中的对象列表不会被下载，需要从 `query` 查询返回的 `AVQuery` 中调用 `findObjectsInBackgroundWithBlock:` 方法来获得文章列表，如：

```objc
[[relation query] findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  if (error) {
     // 呃，报错了
  } else {
    // objects 包含了当前用户喜欢的所有文章
  }
}];
```

如果只想要文章对象的子集，则要对 `AVQuery` 添加额外的限制，如：

```objc
AVQuery *query = [relation query];
// 增加其他查询限制条件
```

如果想反向查询，比如，一篇文章被哪些用户喜欢过，可使用 `reverseQuery:`，例如：

```objc
AVUser *user = [AVUser currentUser];
AVRelation *relation = [user relationforKey:@"myLikes"];
AVObject *post = [AVObject objectWithClassName:@"post"];
[post setObject:@"article content" forKey:@"content"];
[post save];
[relation addObject:post];
[user save];


AVQuery *query = [AVRelation reverseQuery:user.className relationKey:@"myLikes" childObject:post];
[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
   // 得到用户列表
}];

```

要了解 `AVQuery` 更多的用法，请阅读本文 [查询](#查询) 部分。`AVRelation` 的行为接近于 `AVObject` 中的 `NSArray`，所以在对象数组上的任何操作也同样适用于 `AVRelation`。

**请阅读《[关系建模指南](./relation_guide.html)》来进一步了解关系类型。**

### 数据类型

到目前为止，我们使用过的数据类型有 `NSString`、 `NSNumber`、 `AVObject`，LeanCloud 还支持 `NSDate` 和 `NSData`。

此外，`NSDictionary` 和 `NSArray` 支持嵌套，这样在一个 `AVObject` 中就可以使用它们来储存更多的结构化数据。例如：

```objc
NSNumber *number = [NSNumber numberWithInt:42];
NSString *string = [NSString stringWithFormat:@"the number is %i", number];
NSDate *date = [NSDate date];
NSData *data = [@"foo" dataUsingEncoding:NSUTF8StringEncoding];
NSArray *array = [NSArray arrayWithObjects:string, number, nil];
NSDictionary *dictionary = [NSDictionary dictionaryWithObjectsAndKeys:number, @"number",
                                                                      string, @"string",
                                                                      nil];

AVObject *bigObject = [AVObject objectWithClassName:@"BigObject"];
[bigObject setObject:number     forKey:@"myNumber"];
[bigObject setObject:string     forKey:@"myString"];
[bigObject setObject:date       forKey:@"myDate"];
[bigObject setObject:data       forKey:@"myData"];
[bigObject setObject:array      forKey:@"myArray"];
[bigObject setObject:dictionary forKey:@"myDictionary"];
[bigObject saveInBackground];
```

我们**不推荐**在 `AVObject` 中使用 `NSData` 类型来储存大块的二进制数据，比如图片或整个文件。每个 `AVObject` 的大小都不应超过 128 KB。如果需要储存更多的数据，建议使用 `AVFile`。更多细节可以阅读本文 [文件](#文件) 部分。

若想了解更多有关 LeanCloud 如何解析处理数据的信息，请查看专题文档《[数据与安全](../data_security.html)》。

## 查询

我们已经看到，`AVQuery` 的 `getObjectWithId:` 方法可以从 LeanCloud 中检索出单个 `AVObject`。此外，`AVQuery` 还提供更多的检索方法，来实现诸如一次检索许多对象、设定检索对象的条件、自动缓存查询结果等操作，免去了开发者需自行撰写代码的麻烦。

### 基本查询

在许多情况下，`getObjectInBackgroundWithId:block:` 并不足以找到目标对象。除了检索单一对象，`AVQuery` 还允许以不同的检索方式来获取包含多个对象的列表。

一般的方式是创建一个 `AVQuery` 并设定相应的条件，然后用 `findObjectsInBackgroundWithBlock:` 检索得到一个与 `AVObject` 匹配的 `NSArray`。

例如，要检索指定 `playerName` 的分数，可以使用 `whereKey:equalTo:` 方法来限定一个键和对应的值。

```objc
AVQuery *query = [AVQuery queryWithClassName:@"GameScore"];
[query whereKey:@"playerName" equalTo:@"Smith"];
[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  if (!error) {
    // 检索成功
    NSLog(@"Successfully retrieved %d scores.", objects.count);
  } else {
    // 输出错误信息
    NSLog(@"Error: %@ %@", error, [error userInfo]);
  }
}];
```

`findObjectsInBackgroundWithBlock:` 可以保证在完成网络请求的同时，不阻塞主线程中的 Block 和回调。

如果已运行在后台线程中，用 `findObjects` 方法可阻塞调用进程：

```objc
// 以下代码仅可用于测试目的，或在后台线程之中运行
AVQuery *query = [AVQuery queryWithClassName:@"GameScore"];
[query whereKey:@"playerName" equalTo:@"Smith"];
NSArray *scoreArray = [query findObjects];
```

### 查询约束

给 `AVQuery` 的检索添加约束条件有多种方法。

用 `whereKey:notEqualTo:` 搭配对应的键和值来过滤对象：

```objc
[query whereKey:@"playerName" notEqualTo:@"Smith"];
```

一次查询可以设置多个约束条件，只有满足所有条件的对象才被返回，这相当于使用 AND 类型的查询条件。

```objc
[query whereKey:@"playerName" notEqualTo:@"Smith"];
[query whereKey:@"playerAge" greaterThan:[NSNumber numberWithInt:18]];
```

用 `limit` 属性来控制返回结果的数量，默认值 100，允许取值范围从 1 到 1000。

```objc
query.limit = 10; // 最多返回 10 条结果
```

如果只需获取一个结果，直接使用 `getFirstObject` 或 `getFirstObjectInBackground`。

```objc
AVQuery *query = [AVQuery queryWithClassName:@"GameScore"];
[query whereKey:@"playerEmail" equalTo:@"dstemkoski@example.com"];
[query getFirstObjectInBackgroundWithBlock:^(AVObject *object, NSError *error) {
  if (!object) {
    NSLog(@"getFirstObject 请求失败。");
  } else {
    // 查询成功
    NSLog(@"对象成功返回。");
  }
}];
```

`skip` 用来跳过初始结果，这对分页非常有用：

```objc
query.skip = 10; // 跳过前 10 条结果
```
对于适用的数据类型，如数字、字符串，可对返回结果进行排序：

```objc
// 升序排列分数
[query orderByAscending:@"score"];

// 降序
[query orderByDescending:@"score"];
```
一个查询可以使用多个排序键：

```objc
// 若上一个排序键相等，分数按升序排列
[query addAscendingOrder:@"score"];

// 如果上一个排序键相等，降序排列分数
[query addDescendingOrder:@"score"];
```
对于适用的数据类型，检索中可以使用「比较」方法：

```objc
// wins < 50
[query whereKey:@"wins" lessThan:[NSNumber numberWithInt:50]];

// wins <= 50
[query whereKey:@"wins" lessThanOrEqualTo:[NSNumber numberWithInt:50]];

// wins > 50
[query whereKey:@"wins" greaterThan:[NSNumber numberWithInt:50]];

// wins >= 50
[query whereKey:@"wins" greaterThanOrEqualTo:[NSNumber numberWithInt:50]];
```

`whereKey:containedIn:` 可查询包含不同值的对象。它接受数组，可实现用单一查询来代替多个查询。

```objc
// 找出 Jonathan、Dario 或 Shawn的分数
NSArray *names = [NSArray arrayWithObjects:@"Jonathan Walsh",
                                           @"Dario Wunsch",
                                           @"Shawn Simon",
                                           nil];
[query whereKey:@"playerName" containedIn:names];
```

相反，要让查询不包含某些值的对象，则用 `whereKey:notContainedIn:` ：

```objc
// 找出除 Jonathan、Dario 和 Shawn 以外其他人的分数 
NSArray *names = [NSArray arrayWithObjects:@"Jonathan Walsh",
                                           @"Dario Wunsch",
                                           @"Shawn Simon",
                                           nil];
[query whereKey:@"playerName" notContainedIn:names];
```

`whereKeyExists` 用来查询具备某一键集条件的对象，`whereKeyDoesNotExist` 正好相反。

```objc
// 找到有分数的对象
[query whereKeyExists:@"score"];

// 没有分数的对象
[query whereKeyDoesNotExist:@"score"];
```

如果要用一个对象中某一键值，去匹配另一个查询结果对象中一个键值，来得到最终结果，可以使用 `whereKey:matchesKey:inQuery:` 。

例如，一个类有球队的信息（所在地），另一个类有用户的信息（家乡），要找出自己家乡球队总赢球的那些用户，则：

```objc
AVQuery *teamQuery = [AVQuery queryWithClassName:@"Team"];
// 获胜比率高于 50%
[teamQuery whereKey:@"winPct" greaterThan:[NSNumber withDouble:0.5]];
AVQuery *userQuery = [AVQuery queryForUser];
// 球队所有地 = 自己家乡
[userQuery whereKey:@"hometown" matchesKey:@"city" inQuery:teamQuery];
[userQuery findObjectsInBackgroundWithBlock:^(NSArray *results, NSError *error) {
    // 得到家乡球队总赢球的所有用户
}];
```
相反，要从一个查询中获取一组对象，该对象的一个键值，与另一个对象的键值并不匹配，可以使用 `whereKey:doesNotMatchKey:inQuery:` 。例如，找出家乡球队表现不佳的那些用户记录：

```objc
AVQuery *losingUserQuery = [AVQuery queryForUser];
[losingUserQuery whereKey:@"hometown" doesNotMatchKey:@"city" inQuery:teamQuery];
[losingUserQuery findObjectsInBackgroundWithBlock:^(NSArray *results, NSError *error) {
    // 得到家乡球队表现不佳的所有用户
}];
```
将 `selectKeys:` 搭配 `NSArray` 类型的键值来使用可以限定查询返回的字段。

例如，让查询结果只包含 `playerName` 和 `score` 字段（也可以是内置字段，如 `objectId`、 `createdAt` 或 `updatedAt`）：

```objc
AVQuery *query = [AVQuery queryWithClassName:@"GameScore"];
[query selectKeys:@[@"playerName", @"score"]];
NSArray *results = [query findObjects];
```
其余字段可以稍后对返回的对象调用 `fetchIfNeeded` 的变体来获取：

```objc
AVObject *object = (AVObject *)[results objectAtIndex:0];
[object fetchIfNeededInBackgroundWithBlock:^(AVObject *object, NSError *error) {
  // 返回该对象的所有字段
}];
```
### 查询数组值

当键值为数组类型时，`equalTo:` 可以从数组中找出包含单个值的对象：

```objc
// 找出 arrayKey 中包含 2 的对象
[query whereKey:@"arrayKey" equalTo:[NSNumber numberWithInt:2]];
```

`containsAllObjectsInArray:` 可以找到包含多个值的对象:

```objc
// 找出 arrayKey 中包含 2、3、4 的对象
[query whereKey:@"arrayKey" containsAllObjectsInArray:@[@2, @3, @4]];
```

### 查询字符串值

使用 `whereKey:hasPrefix:` 可以过滤出以特定字符串开头的结果，这有点像 MySQL 的 `LIKE` 条件。因为支持索引，所以该操作对于大数据集也很高效。

```objc
// 找出名字以 "Big Daddy's" 开头的烤肉调料
AVQuery *query = [AVQuery queryWithClassName:@"BarbecueSauce"];
[query whereKey:@"name" hasPrefix:@"Big Daddy's"];
```

### 关系查询
检索关系数据有几种方法。如果用某个属性去匹配一个已知的 `AVObject` 对象，仍然可以使用 `whereKey:equalTo:`，就像使用其他数据类型一样。

例如，如果每条评论 `Comment` 的 `post` 字段都有一个 `Post` 文章对象，那么找出指定文章下的评论：

```objc
// 假设前面已建好了 myPost 这个 AVObject 对象
AVQuery *query = [AVQuery queryWithClassName:@"Comment"];
[query whereKey:@"post" equalTo:myPost];

[query findObjectsInBackgroundWithBlock:^(NSArray *comments, NSError *error) {
    // comments 包含了 myPost 下的所有评论
}];
```

或通过 `ObjectId` 做关系查询：

```objc
[query whereKey:@"post"
        equalTo:[AVObject objectWithoutDataWithClassName:@"Post" objectId:@"51c912bee4b012f89e344ae9"];
```
如果要做嵌套查询，请使用 `whereKey:matchesQuery`。

注意：结果返回数量（默认 100 最多 1000）的限制也适用于内嵌查询，所以在处理大型数据集时，你可能需要仔细设置查询条件来获得想要的结果。

例如，找出所有带图片的文章的评论：

```objc
AVQuery *innerQuery = [AVQuery queryWithClassName:@"Post"];
[innerQuery whereKeyExists:@"image"];
AVQuery *query = [AVQuery queryWithClassName:@"Comment"];
[query whereKey:@"post" matchesQuery:innerQuery];
[query findObjectsInBackgroundWithBlock:^(NSArray *comments, NSError *error) {
    // comments now contains the comments for posts with images
}];
```

相反，`whereKey:doesNotMatchQuery:` 可以找出一个对象的某个属性与另一个查询不匹配的结果。例如，找出所有 不带图片的文章的评论：

```objc
AVQuery *innerQuery = [AVQuery queryWithClassName:@"Post"];
[innerQuery whereKeyExists:@"image"];
AVQuery *query = [AVQuery queryWithClassName:@"Comment"];
[query whereKey:@"post" doesNotMatchQuery:innerQuery];
[query findObjectsInBackgroundWithBlock:^(NSArray *comments, NSError *error) {
    // comments 包含了所有没有图片的文章的评论
}];
```

在一些场景中，如果需要在一个查询中返回多个类型的关联属性，可以使用方法 `includeKey:`。例如，搜索最近的十条评论，并同时找出与之对应的文章：

```objc
AVQuery *query = [AVQuery queryWithClassName:@"Comment"];

// 找出最近刚创建的记录
[query orderByDescending:@"createdAt"];

// 只取前十条
query.limit = [NSNumber numberWithInt:10];

// 找出每条评论所对应的文章
[query includeKey:@"post"];

[query findObjectsInBackgroundWithBlock:^(NSArray *comments, NSError *error) {
    // comments 是最近的十条评论, 其 post 字段也有相应数据
    for (AVObject *comment in comments) {
         // 并不需要网络访问
         AVObject *post = [comment objectForKey:@"post"];
         NSLog(@"retrieved related post: %@", post);
    }
}];
```

**使用点（`.`）操作符可以检索多层级的数据**。例如，在结果中加入评论所对应的文章，以及该文章的作者：

```objc
[query includeKey:@"post.author"];
```
`includeKey:` 既可在一次查询中多次使用来返回多个属性，也可与 `AVQuery` 的 `getFirstObject` 和 `getObjectInBackground` 等辅助方法配合使用。

还有一种情况，当某些对象包括多个键，而某些键的值包含的数据量又比较大，你并不希望返回所有的数据，只想要特定键所对应的数据，这时可以用 `selectKeys:`：

```objc
AVQuery *query = [AVQuery queryWithClassName:@"someClass"];
[query selectKeys:@[@"key"]];
AVObject *result = [query getFirstObject];
```

只返回指定键对应的有限数据，而非所有数据，有助于节省网络带宽和计算资源。

### 缓存查询
通常，将请求结果缓存到磁盘上是一种行之有效的方法，这样就算设备离线，应用刚刚打开，网络请求尚未完成时，数据也能显示出来。当缓存占用太多空间时，LeanCloud 会自动对其清理。

默认的查询行为不使用缓存，需要通过 `query.cachePolicy` 来启用。例如，当网络不可用时，尝试网络连接并同时取回已缓存的数据:

```objc
AVQuery *query = [AVQuery queryWithClassName:@"GameScore"];
query.cachePolicy = kPFCachePolicyNetworkElseCache;

//设置缓存有效期
query.maxCacheAge = 24*3600;

[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  if (!error) {
    // 成功找到结果，先找网络再访问磁盘
  } else {
    // 无法访问网络，本次查询结果未做缓存
  }
}];

```
LeanCloud 提供了几种不同的缓存策略：

* `kPFCachePolicyIgnoreCache`
  **（默认缓存策略）**查询行为不从缓存加载，也不会将结果保存到缓存中。
* `kPFCachePolicyCacheOnly`
  查询行为忽略网络状况，只从缓存加载。如果没有缓存结果，该策略会产生 `AVError`。
* `kPFCachePolicyCacheElseNetwork`
  查询行为首先尝试从缓存加载，若加载失败，则通过网络加载结果。如果缓存和网络获取行为均为失败，则产生 `AVError`。
* `kPFCachePolicyNetworkElseCache`
  查询行为先尝试从网络加载，若加载失败，则从缓存加载结果。如果缓存和网络获取行为均为失败，则产生 `AVError`。
* `kPFCachePolicyCacheThenNetwork`
  查询先从缓存加载，然后从网络加载。在这种情况下，回调函数会被调用两次，第一次是缓存中的结果，然后是从网络获取的结果。因为它会在不同的时间返回两个结果，所以该策略不能与 `findObjects` 同时使用。

要控制缓存行为，可以使用 `AVQuery` 提供的相应方法：

* 检查是否存在缓存查询结果：

  ```objc
  BOOL isInCache = [query hasCachedResult];
  ```
* 删除某一查询的任何缓存结果：

  ```objc
  [query clearCachedResult];
  ```
* 删除查询的所有缓存结果：

  ```objc
  [AVQuery clearAllCachedResults];
  ```
* 设定缓存结果的最长时限：

  ```objc
  query.maxCacheAge = 60 * 60 * 24; // 一天的总秒数
  ```

查询缓存也适用于 `AVQuery` 的辅助方法，包括 `getFirstObject` 和 `getObjectInBackground`。

### 对象计数

如果只需要得到查询出来的对象数量，不需要检索匹配的对象，可以用 `countObjects` 来代替 `findObjects`。

例如，计算一下某位球员参加了多少场比赛：

```objc
AVQuery *query = [AVQuery queryWithClassName:@"GameScore"];
[query whereKey:@"playername" equalTo:@"Sean Plott"];
[query countObjectsInBackgroundWithBlock:^(int count, NSError *error) {
  if (!error) {
    // 查询成功，输出计数
    NSLog(@"Sean 参加了 %d 场比赛", count);
  } else {
    // 查询失败
  }
}];
```

`countObjects` 是一种同步式的方法，因此使用它可以阻塞调用线程。

对含有超过 1000 个对象的类，使用计数操作很可能会导致响应超时，或返回数值近似精确，所以在构建程序时，应该尽量避免这样的操作。

### 复合查询
如果想从多个查询中，找出与其中任意一个相匹配的对象，可以使用方法 `orQueryWithSubqueries:`。

例如，找出赢了很多场比赛或者只赢了几场比赛的球员：

```objc
AVQuery *lotsOfWins = [AVQuery queryWithClassName:@"Player"];
[lotsOfWins whereKey:@"wins" greaterThan:[NSNumber numberWithInt:150]];

AVQuery *fewWins = [AVQuery queryWithClassName:@"Player"];
[fewWins whereKey:@"wins" lessThan:[NSNumber numberWithInt:5]];
AVQuery *query = [AVQuery orQueryWithSubqueries:[NSArray arrayWithObjects:fewWins,lotsOfWins,nil]];
[query findObjectsInBackgroundWithBlock:^(NSArray *results, NSError *error) {
  // 返回赢球次数大于 150 场或小于 5 场的球员
  }];
```

你可以对新创建的 `AVQuery` 添加额外的约束，多个约束将以 AND 运算符来联接。

注意：在复合查询的子查询中，不能使用非过滤性的约束（如 `limit`、 `skip`、`orderBy...:`、 `includeKey:`）。

### Cloud Query Language（CQL）查询
我们还提供类似于 SQL 语言的查询语言 CQL，使用方法如下：

```objc
    NSString *cql = [NSString stringWithFormat:@"select * from %@", @"ATestClass"];
    AVCloudQueryResult *result = [AVQuery doCloudQueryWithCQL:cql];
    NSLog(@"results:%@", result.results);

    cql = [NSString stringWithFormat:@"select count(*) from %@", @"ATestClass"];
    result = [AVQuery doCloudQueryWithCQL:cql];
    NSLog(@"count:%lu", (unsigned long)result.count);
```
通常，查询语句会使用变量参数。为此，我们提供了与 Java JDBC 所使用的 `PreparedStatement` 占位符查询相类似的语法结构。

```objc
    NSString *cql = [NSString stringWithFormat:@"select * from %@ where durability = ? and name = ?", @"ATestClass"];
    NSArray *pvalues =  @[@100,@"祈福"];
    [AVQuery doCloudQueryInBackgroundWithCQL:cql pvalues:pvalues callback:^(AVCloudQueryResult *result, NSError *error) {
        if (!error) {
            // 操作成功
        } else {
            NSLog(@"%@", error);
        }
    }];
```
可变参数 `100` 和 `"祈福"` 会被自动替换到查询语句中的问号位置（按问号出现的先后顺序）。我们更推荐使用占位符语法，理论上这样会降低 CQL 转换的性能开销。

关于 CQL 的详细介绍，请参考 [Cloud Query Language 详细指南](cql_guide.html)。

## 子类化

LeanCloud 设计的目标是让你的应用尽快运行起来。你可以用 `AVObject` 访问到所有的数据，用 `objectForKey:` 获取任意字段。 在成熟的代码中，子类化有很多优势，包括降低代码量，具有更好的扩展性，和支持自动补全。

子类化是可选的，请对照下面的例子来加深理解：

    AVObject *student = [AVObject objectWithClassName:@"Student"];
    [student setObject:@"小明" forKey:@"name"];
    [student saveInBackground];

可改写成:

    Student *student = [Student object];
    student.name = @"小明";
    [student saveInBackground];

这样代码看起来是不是更简洁呢？

### 子类化的实现

要实现子类化，需要下面几个步骤：

1. 导入 `AVObject+Subclass.h`；
2. 继承 `AVObject` 并实现 `AVSubclassing` 协议；
3. 实现类方法 `parseClassName`，返回的字符串是原先要传给 `initWithClassName:` 的参数，这样后续就不必再进行类名引用了。如果不实现，默认返回的是类的名字。**请注意： `AVUser` 子类化后必须返回 `_User`**；
4. 在实例化子类之前调用 `[YourClass registerSubclass]`（**在应用当前生命周期中，只需要调用一次**，所以建议放在 `ApplicationDelegate` 中，在 `[AVOSCloud setApplicationId:clientKey:]` 之前调用即可）。

下面是实现 `Student` 子类化的例子:

```objc
  //Student.h
  #import <AVOSCloud/AVOSCloud.h>

  @interface Student : AVObject <AVSubclassing>

  @property(nonatomic,copy) NSString *name;

  @end


  //Student.m
  #import "Student.h"

  @implementation Student

  @dynamic name;

  + (NSString *)parseClassName {
      return @"Student";
  }

  @end


  // AppDelegate.m
  #import <AVOSCloud/AVOSCloud.h>
  #import "Student.h"

  - (BOOL)application:(UIApplication *)application
  didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    [Student registerSubclass];
    [AVOSCloud setApplicationId:appid clientKey:appkey];
  }
```

### 属性

为 `AVObject` 的子类添加自定义的属性和方法，可以更好地将这个类的逻辑封装起来。用 `AVSubclassing` 可以把所有的相关逻辑放在一起，这样不必再使用不同的类来区分业务逻辑和存储转换逻辑了。

`AVObject` 支持动态 synthesizer，就像 `NSManagedObject` 一样。先正常声明一个属性，只是在 .m 文件中把 `@synthesize` 变成 `@dynamic`。

请看下面的例子是怎么添加一个「年龄」属性：

```objc
  //Student.h
  #import <AVOSCloud/AVOSCloud.h>

  @interface Student : AVObject <AVSubclassing>

  @property int age;

  @end


  //Student.m
  #import "Student.h"

  @implementation Student

  @dynamic age;

  ......
```

这样就可以通过 `student.age = 19` 这样的方式来读写 `age` 字段了，当然也可以写成： 
```objc
[student setAge:19]
```

**注意：属性名称保持首字母小写！**（错误：`student.Age` 正确：`student.age`）。

`NSNumber` 类型的属性可用 `NSNumber` 或者是它的原始数据类型（`int`、 `BOOL` 等）来实现。例如， `[student objectForKey:@"age"]` 返回的是 `NSNumber` 类型，而实际被设为 `int` 类型。下面这个属性也是同样的情况：

```objc
@property BOOL isTeamMember;
```

你可以根据自己的需求来选择使用哪种类型。原始类型更为易用，而 `NSNumber` 支持 `nil` 值，这可以让结果更清晰易懂。

注意：`AVRelation` 同样可以作为子类化的一个属性来使用，比如：

```objc
@interface Student : AVUser <AVSubclassing>
@property(retain) AVRelation *friends
  ......
```

如果要使用更复杂的逻辑而不是简单的属性访问，可以这样实现:

```objc
  @dynamic iconFile;

  - (UIImageView *)iconView {
    UIImageView *view = [[UIImageView alloc] initWithImage:kPlaceholderImage];
    view.image = [UIImage imageNamed:self.iconFile];
    return [view autorelease];
  }

```

### 针对 AVUser 子类化的特别说明

假如现在已经有一个基于 `AVUser` 的子类，如上面提到的 `Student`:

```objc
@interface Student : AVUser<AVSubclassing>
@property (retain) NSString *displayName;
@end


@implementation Student
@dynamic displayName;
+ (NSString *)parseClassName {
    return @"_User";
}
@end
```

登录时需要调用 `Student` 的登录方法才能通过 `currentUser` 得到这个子类:

```objc
[Student logInWithUsernameInBackground:@"USER_NAME" password:@"PASSWORD" block:^(AVUser *user, NSError *error) {
        Student *student = [AVUser currentUser];
        studen.displayName = @"YOUR_DISPLAY_NAME";
    }];
```

### 初始化子类

创建一个子类实例，要使用 `object` 类方法。要创建并关联到已有的对象，请使用 `objectWithoutDataWithObjectId:` 类方法。

### 子类查询

使用类方法 `query` 可以得到这个子类的查询对象。

例如，查询年龄小于 21 岁的学生：

```objc
  AVQuery *query = [Student query];
  [query whereKey:@"age" lessThanOrEqualTo:@"21"];
  [query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
    if (!error) {
      Student *stu1 = [objects objectAtIndex:0];
      // ...
    }
  }];
```

## ACL权限控制

ACL（Access Control List）是最灵活而且简单的应用数据安全管理方法。通俗的解释就是为每一个数据创建一个访问的白名单列表，只有在名单上的用户（ `AVUser`）或者具有某种角色（`AVRole`）的用户才能被允许访问。为了更好地保证用户数据安全性，LeanCloud 的每一张表中都有一个 ACL 列。

当然，LeanCloud 还提供了进一步的读写权限控制。一个 User 必须拥有读权限（或者属于一个拥有读权限的 Role）才可以获取一个对象的数据；同时，一个 User 需要写权限（或者属于一个拥有写权限的 Role）才可以更改或者删除一个对象。

以下列举了几种在 LeanCloud 常见的 ACL 使用范例。

### 默认访问权限
在没有显式指定的情况下，LeanCloud 中的每一个对象都会有一个默认的 ACL 值。这个值表示，所有的用户对这个对象都是可读可写的。此时在 LeanCloud 账户的「数据管理」列表中的 ACL 属性列，会看到这样的值：

```json
    {"*":{"read":true,"write":true}}
```

对应的 Objective-C 代码是：

```objc
    AVACL *acl = [AVACL ACL];
    [acl setPublicReadAccess:YES];
    [acl setPublicWriteAccess:YES];
```
当然正如上文提到的，默认的 ACL 并不需要进行显式指定。

### 指定用户访问权限
当一个用户在实现一个网盘类应用时，针对不同文件的私密性，用户就需要不同的文件访问权限。譬如公开的文件，每一个其他用户都有读的权限，然后仅仅只有创建者才拥有更改和删除的权限。

```objc

    AVACL *acl = [AVACL ACL];
    [acl setPublicReadAccess:YES]; //此处设置的是所有人的可读权限
    [acl setWriteAccess:YES forUser:[AVUser currentUser]]; //而这里设置了文件创建者的写权限

    AVObject * object = [AVObject objectWithClassName:@"iOSAclTest"];

    object.ACL=acl;
    [object save];

```

当然用户也会上传一些隐私文件，只有这些文件的创建者才对这些文件拥有读写权限：

```objc
    [acl setWriteAccess:YES forUser:[AVUser currentUser]];
```
注：一旦显式设置了 ACL，默认的 ACL 就会被覆盖。

### 指定角色访问权限

#### AVUser 与 AVRole 的从属关系

指定用户访问权限虽然很方便，但是依然会有局限性。

以工资系统为例，一家公司的工资系统，工资最终的归属者和公司的出纳们只对工资有读的权限，而公司的人事和老板才拥有全部的读写权限。当然你可以通过多次设置指定用户的访问权限来实现这一功能（多个用户的 ACL 设置是追加的而非覆盖）。

```objc
    AVObect *salary = [AVObject objectWithClassName:@"Salary"];
    [salary setObject:@(2000000) forKey:@"value"];

    //这里为了方便说明, 直接声明了变量, 但没有实现
    AVUser *boss;//假设此处为老板
    AVUser *hrWang;  //人事小王
    AVUser *me; //我们就在文档里爽一爽吧
    AVUser *cashierZhou; //出纳老周


    AVACL *acl = [AVACL ACL];

    //4 个人都有可读权限
    [acl setReadAccess:YES forUser:boss];
    [acl setReadAccess:YES forUser:hrWang];
    [acl setReadAccess:YES forUser:cashierZhou];
    [acl setReadAccess:YES forUser:me];

    //只有 2 个人可写
    [acl setWriteAccess:YES forUser:boss];
    [acl setWriteAccess:YES forUser:hrWang];

    [salary setACL:acl];
    [salary save];


```

但是涉及的人可能不止一个，也有离职、换岗、新员工的问题存在。这样的代码既不优雅，也太啰嗦，同样会很难维护。这个时候我们就引入了 `AVRole` 来解决这个问题。

公司的员工可以成百上千，然而一个公司组织里的角色却能够在很长一段时间内保持相对稳定。

```objc
    AVObect *salary = [AVObject objectWithClassName:@"Salary"];
    [salary setObject:@(2000000) forKey:@"value"];

    //这里为了方便说明, 直接声明了变量, 但没有实现
    AVUser *boss;//假设此处为老板
    AVUser *hrWang;  //人事小王
    AVUser *me; //我们就在文档里爽一爽吧
    AVUser *cashierZhou; //出纳老周
    AVUser *cashierGe;//出纳小葛

    //这段代码可能放在员工管理界面更恰当，但是为了示意，我们就放在这里
    AVRole *hr =[AVRole roleWithName:@"hr"];
    AVRole *cashier = [AVRole roleWithName:@"cashier"];

    [[hr users] addObject:hrWang];
    [hr save];
    //此处对应的是 AVRole 里面有一个叫做 users 的 Relation 字段
    [[cashier users] addObject:cashierZhou];
    [[cashier users] addObject:cashierGe];
    [cashier save];

    AVACL *acl = [AVACL ACL];
    //老板假设只有一个
    [acl setReadAccess:YES forUser:boss];
    [acl setReadAccess:YES forUser:me];

    [acl setReadAccess:YES forRole:hr];
    [acl setReadAccess:YES forRole:cashier];

    [acl setWriteAccess:YES forUser:boss];
    [acl setWriteAccess:YES forRole:hr];

    [salary setACL:acl];
    [salary save];
```

当然如果考虑到一个角色（`AVRole`）里面有多少员工（`AVUser`），编辑这些员工所需要的权限控制，`AVRole` 同样也有 `setACL` 方法可以使用。

#### AVRole 之间的从属关系

在讲清楚了用户与角色的关系后，我们还有一层角色与角色之间的关系，下面的例子或许可以帮助你理解这个概念。

一家创业公司设有移动部门，该部门下面有不同的小组（Android 和 iOS），每个小组只对自己组的代码拥有「读写」权限，但他们同时对核心库代码拥有「读取」权限。

```objc
    AVRole *androidTeam = [AVRole roleWithName:@"AndroidTeam"];
    AVRole *iOSTeam = [AVRole roleWithName:@"IOSTeam"];
    AVRole *mobileDep = [AVRole roleWithName:@"MobileDep"];

    [androidTeam save];
    [iOSTeam save];

    [[mobileDep roles] addObject:androidTeam];
    [[mobileDep roles] addObject:iOSTeam];

    [mobileDep save];

    AVObject *androidCode = [AVObject objectWithClassName:@"Code"];
    AVObject *iOSCode = [AVObject objectWithClassName:@"Code"];
    AVObject *coreCode = [AVObject objectWithClassName:@"Code"];
    //.....此处省略一些具体的值设定

    AVACL *acl1=[AVACL ACL];
    [acl1 setReadAccess:YES forRole:androidTeam];
    [acl1 setWriteAccess:YES forRole:androidTeam];
    [androidCode setACL:acl1];

    AVACL *acl2=[AVACL ACL];
    [acl2 setReadAccess:YES forRole:iOSTeam];
    [acl2 setWriteAccess:YES forRole:iOSTeam];
    [iOSCode setACL:acl2];

    AVACL *acl3=[AVACL ACL];
    [acl3 setReadAccess:YES forRole:mobileDep];
    [coreCode setACL:acl3];

    [androidCode save];
    [iOSTeam save];
    [coreCode save];
```


## 文件


### AVFile

`AVFile` 可以让你的应用程序将文件存储到服务器中，比如常见的文件类型图像文件、影像文件、音乐文件和任何其他二进制数据都可以使用。
使用 `AVFile` 非常容易，首先你可以将文件数据存在 `NSData` 中，然后由 `NSData` 创建一个 `AVFile` 对象。 在下面的例子中，我们会使用一个字符串：

```objc
NSData *data = [@"Working with LeanCloud is great!" dataUsingEncoding:NSUTF8StringEncoding];
AVFile *file = [AVFile fileWithName:@"resume.txt" data:data];
```

请注意，在本例中，我们将文件名定为 `resume.txt`。这里有两件事情值得注意:

* 你不需要担心文件名的冲突。每一个上传的文件有惟一的ID，所即使上传多个文件名为 `resume.txt` 的文件也不会有问题。
* 给文件添加扩展名非常重要，通过扩展名，LeanCloud 可以获取文件类型以便可以正确处理文件。所以如果你将一个 `PNG` 图象存在 `AVFile` 中，要确保使用 `.png` 扩展名。

然后你会需要将文件存在LeanCloud中，你可以根据需要调用不同版本的save方法。

```objc
[file saveInBackground];
```

最终当文件存储完成后，你可以象其他的对象那样，将 `AVFile` 关联到 `AVObject`。

```objc
AVObject *jobApplication = [AVObject objectWithClassName:@"JobApplication"]
[jobApplication setObject:@"Joe Smith" forKey:@"applicantName"];
[jobApplication setObject:file         forKey:@"applicantResumeFile"];
[jobApplication saveInBackground];
```

重新获取只需要调用 `AVFile` 的 `getData`。


```objc
AVFile *applicantResume = [anotherApplication objectForKey:@"applicantResumeFile"];
NSData *resumeData = [applicantResume getData];
```

如 `AVObject` 那样，你也可以使用 `getData` 的异步版本。

**如果将文件存储到对象的一个数组类型的属性内，那么必须在查询该对象的时候加上include该属性，否则查询出来的数组将是AVObject数组。**

### 图象

你可以通过将图象转成 `NSData`，然后使用 `AVFile`，这样可以很容易地将图象存到LeanCloud上。比如你有一个叫"image"的 `UIImage` 对象，你希望将它存到 `AVFile` 中。

```objc
NSData *imageData = UIImagePNGRepresentation(image);
AVFile *imageFile = [AVFile fileWithName:@"image.png" data:imageData];
[imageFile save];

AVObject *userPhoto = [AVObject objectWithClassName:@"UserPhoto"];
[userPhoto setObject:@"My trip to Hawaii!" forKey:@"imageName"];
[userPhoto setObject:imageFile             forKey:@"imageFile"];
[userPhoto save];
```

### 进度提示

通过 `saveInBackgroundWithBlock:progressBlock:` 和 `getDataInBackgroundWithBlock:progressBlock:`  很容易可以得到 `AVFile` 的上传或者下载的进度。比如

```objc
NSData *data = [@"Working at AVOS is great!" dataUsingEncoding:NSUTF8StringEncoding];
AVFile *file = [AVFile fileWithName:@"resume.txt" data:data];
[file saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
  // Handle success or failure here ...
} progressBlock:^(int percentDone) {
  // Update your progress spinner here. percentDone will be between 0 and 100.
}];
```

### 得到图象的缩略图

当您保存了一个图象文件时，您可能希望在下载原图之前，得到缩略图，我们为您提供了便捷的API，您可以使用

```objc
AVFile * file = [AVFile fileWithURL:@"the-file-remote-url"];
[file getThumbnail:YES width:100 height:100 withBlock:^(UIImage * image, NSError *error) {
    }];
```
得到缩略图

### 文件元数据

某些时候，您会希望将一些元数据保存在文件对象中，您可以通过metadat属性来保存和获取这些数据

```objc
AVFile * file = [AVFile fileWithName:@"test.jpg" contentsAtPath:@"file-local-path"];
[file.metadata setObject:@(100) forKey:@"width"];
[file.metadata setObject:@(100) forKey:@"height"];
[file.metadata setObject:@”LeanCloud" forKey:@"author"];
NSError * error = nil;
[file save:&error];
```

### 删除

当您的文件比较多时，您可能希望将一些不需要的文件从LeanCloud上删除，您可以使用
```objc
[file deleteInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
}];
```
来删除您的文件

### 清除缓存
AVFile也提供了清除缓存的方法

```objc
//清除当前文件缓存
- (void)clearCachedFile;

//类方法, 清除所有缓存
+ (BOOL)clearAllCachedFiles;

//类方法, 清除多久以前的缓存
+ (BOOL)clearCacheMoreThanDays:(NSInteger)numberOfDays;

```


## 用户

用户是一个应用程序的核心。对于个人开发者来说，能够让自己的应用程序积累到多的用户，就能给自己带来更多的创作动力。因此LeanCloud提供了一个专门的用户类，AVUser来自动处理用户账户管理所需的功能。
有了这个类，你就可以在您的应用程序中添加用户账户功能。
AVUser是一个AVObject的子类，它继承了AVObject所有的方法具有AVObject相同的功能。不同的是，AVUser增加了一些特定的关于用户账户相关的功能。

### 属性
AVUser除了从AVObject继承的属性外，还有几个特定的属性：
username: 用户的用户名（必需）。
password: 用户的密码（必需）。
email: 用户的电子邮件地址（可选）。
和其他AVObject对象不同的是，在设置AVUser这些属性的时候不是使用的put方法，而是专门的setXXX方法。


### 注册

你的应用程序会做的第一件事可能是要求用户注册。下面的代码是一个典型的注册过程：

```objc
AVUser * user = [AVUser user];
user.username = @"steve";
user.password =  @"f32@ds*@&dsa";
user.email = @"steve@company.com";
[user setObject:@"213-253-0000" forKey:@"phone"];

[user signUpInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
    if (succeeded) {

    } else {

    }
}];
```

在注册过程中，服务器会进行注册用户信息的检查，以确保注册的用户名和电子邮件地址是惟一的。**服务端还会对用户密码进行不可逆的加密处理，不会明文保存任何密码，应用切勿再次在客户端加密密码，这会导致重置密码等功能不可用**。请注意，我们使用的是signUpInBackgroundWithBlock方法，而不是saveInBackground方法。另外还有各种不同的signUp方法。像往常一样，我们建议在可能的情况下尽量使用异步版本的signUp方法，这样就不会影响到应用程序主UI线程的响应。你可以阅读API中更多的有关这些具体方法的使用。
如果注册不成功，你可以查看返回的错误对象。最有可能的情况是，用户名或电子邮件已经被另一个用户注册。这种情况您可以提示用户，要求他们尝试使用不同的用户名进行注册。
你也可以要求用户使用Email做为用户名注册，这样做的好处是，你在提交信息的时候可以将输入的“用户名“默认设置为用户的Email地址，以后在用户忘记密码的情况下可以使用LeanCloud提供重置密码功能。

关于自定义邮件模板和验证链接请看这篇[博客](http://blog.leancloud.cn/blog/2014/01/09/zi-ding-yi-ying-yong-nei-yong-hu-zhong-she-mi-ma-he-you-xiang-yan-zheng-ye-mian/)。

### 登录
当用户注册成功后，您需要让他们以后能够登录到他们的账户后使用应用。要做到这样一点，你可以使用
AVUser类的loginInBackground方法。

```objc
[AVUser logInWithUsernameInBackground:@"username" password:@"password" block:^(AVUser *user, NSError *error) {
    if (user != nil) {

    } else {

    }
}];
```

### 当前用户

如果用户在每次打开你的应用程序时都要登录，这将会直接影响到你应用的用户体验。为了避免这种情况，你可以使用缓存的currentUser对象。
每当你注册成功或是第一次登录成功，都会在本地磁盘中又一个缓存的用户对象，你可以这样来获取这个缓存的用户对象来进行登录：


```objc
AVUser * currentUser = [AVUser currentUser];
if (currentUser != nil) {
    // 允许用户使用应用
} else {
    //缓存用户对象为空时， 可打开用户注册界面…
}
```

当然，你也可以使用如下方法清除缓存用户对象：

```objc
[AVUser logOut];  //清除缓存用户对象
AVUser * currentUser = [AVUser currentUser]; // 现在的currentUser是nil了
```

### 重置密码
这是一个事实，一旦你引入了一个密码系统，那么肯定会有用户忘记密码的情况。对于这种情况，我们提供了一种方法，让用户安全地重置起密码。
重置密码的流程很简单，开发者只要求用户输入注册的电子邮件地址即可：

```objc
[AVUser requestPasswordResetForEmailInBackground:@"myemail@example.com" block:^(BOOL succeeded, NSError *error) {
    if (succeeded) {

    } else {

    }
}];
```

密码重置流程如下：

 * 用户输入他们的电子邮件，请求重置自己的密码。
 * LeanCloud向他们的邮箱发送一封包含特殊的密码重置连接的电子邮件。
 * 用户根据向导点击重置密码连接，打开一个特殊的页面，让他们输入一个新的密码。
 * 用户的密码已被重置为新输入的密码。

关于自定义邮件模板和验证链接请看这篇[博客](http://blog.leancloud.cn/blog/2014/01/09/zi-ding-yi-ying-yong-nei-yong-hu-zhong-she-mi-ma-he-you-xiang-yan-zheng-ye-mian/)。

### 修改密码

当用户系统中存在密码的时候，就会存在用户更改密码的需求，对于这种情况，我们提供了一种方法，能够同时验证老密码和修改新密码:

```objc
[AVUser logInWithUsername:@"username" password:@"111111"]; //请确保用户当前的有效登录状态
[[AVUser currentUser] updatePassword:@"111111" newPassword:@"123456" block:^(id object, NSError *error) {
    //doSomething
}];
```
如果要求更改密码的用户不再登录状态、原密码错误和用户不存在等情况都会通过callback返回。

###  手机号码验证

在应用设置中打开`注册手机号码验证`选项后。当你在注册用户时，填写用户手机字段后，LeanCloud 会自动向该手机号码发送一个验证短信，用户在输入验证码以后，该用户就被表示为已经验证过手机。

以下代码就可发送注册验证码到用户手机:

```objc
	AVUser * user = [AVUser user];
	user.username = @"steve";
	user.password =  @"f32@ds*@&dsa";
	user.email = @"steve@company.com";
	user.mobilePhoneNumber = @"13613613613";
	NSError *error = nil;
	[user signUp:&error];
```

调用以下代码即可验证验证码:

```objc
	[AVUser verifyMobilePhone:@"123456" withBlock:^(BOOL succeeded, NSError *error) {
        //验证结果
    }];
```

验证成功后，用户的`mobilePhoneVerified`属性变为true，并且调用云代码的`AV.Cloud.onVerifed('sms', function)`方法。

### 手机号码登录

在手机号码被验证后，用户可以使用手机号码进行登录。手机号码包括两种方式：手机号码＋密码方式，手机号码＋短信验证码方式。

以下为手机号码＋密码来登录的方式：

```objc
    [AVUser logInWithMobilePhoneNumberInBackground:@"13613613613" password:@"yourpassword" block:^(AVUser *user, NSError *error) {

    }];
```

以下为发送登录短信验证码：

```objc
    [AVUser requestLoginSmsCode:@"123456" withBlock:^(BOOL succeeded, NSError *error) {

    }];
```

最后使用短信验证码＋手机号码进行登录:

```objc
    [AVUser logInWithMobilePhoneNumberInBackground:@"13613613613" smsCode:smsCode block:^(AVUser *user, NSError *error) {

    }];
```

### 手机号码重置密码
和使用电子邮件地址重置密码类似，使用手机号码重置密码使用下面的方法获取短信验证码：

```objc
[AVUser requestPasswordResetWithPhoneNumber:@"18812345678" block:^(BOOL succeeded, NSError *error) {
    if (succeeded) {

    } else {

    }
}];
```

注意用户需要先绑定手机号码。
然后使用短信验证码重置密码：

```objc
[AVUser resetPasswordWithSmsCode:@"123456" newPassword:@"password" block:^(BOOL succeeded, NSError *error) {
    if (succeeded) {

    } else {

    }
}];
```

### 查询

查询用户，你需要使用特殊的用户查询对象来完成：

```objc
AVQuery * query = [AVUser query];
[query whereKey:@"gender" equalTo:@"female"];
[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
    if (error == nil) {

    } else {

    }
}];

```

浏览器中查看用户表
User表是一个特殊的表，专门存储AVUser对象。在浏览器端，你会看到一个_user表。

### 匿名用户
如果你需要创建匿名用户，可以使用 `AVAnonymousUtils` 来完成。通过如下代码，服务端会为你自动创建一个 `AVUser` 对象，其用户名为随机字符串。
完成之后，`currentUser` 会被置为此用户对象。之后的修改、保存、登出等操作都可以使用 `currentUser` 来完成。

```objc
    [AVAnonymousUtils logInWithBlock:^(AVUser *user, NSError *error) {
        if (user) {

        } else {

        }
    }];
```

## 地理位置
LeanCloud允许用户根据地球的经度和纬度坐标进行基于地理位置的信息查询。你可以在AVObject的查询中添加一个AVGeoPoint的对象查询。您可以实现轻松查找出离当前用户最接近的信息或地点的功能。

### 地理位置对象
首先需要创建一个AVGeoPoint对象。例如，创建一个北纬40.0度-东经-30.0度的AVGeoPoint对象：

```objc
AVGeoPoint * point = [AVGeoPoint geoPointWithLatitude:40.0 longitude:-30.0];new AVGeoPoint(40.0, -30.0);
```

添加地理位置信息

```objc
[placeObject setObject:point forKey:@"location"];
```

### 地理查询

现在，你的数据表中有了一定的地理坐标对象的数据，这样可以测试找出最接近某个点的信息了。你可以使用AVQuery对象的whereNear方法来这样做：

```objc
AVObject * userObject = nil;
AVGeoPoint * userLocation =  (AVGeoPoint *) [userObject objectForKey:@"location"];
AVQuery * query = [AVQuery queryWithClassName:@"PlaceObject"];
[query whereKey:@"locaton" nearGeoPoint:userLocation];
query.limit = 10;      //获取最接近用户地点的10条数据
NSArray<AVObject *> nearPlaces = [query findObjects];
```

在以上代码中，nearPlaces是一个返回的距离userLocation点（最近到最远）的对象数组。
要限制查询指定距离范围的数据可以使用whereWithinKilometers、whereWithinMiles或whereWithinRadians方法。
要查询一个矩形范围内的信息可以使用whereWithinGeoBox来实现：

```objc
AVGeoPoint * northeastOfSF = [AVGeoPoint geoPointWithLatitude:37.9 longitude:40.1];
AVGeoPoint * southwestOfSF = [AVGeoPoint geoPointWithLatitude:37.8 longitude:40.04];
AVQuery * query = [AVQuery queryWithClassName:@"PizzaPlaceObject"];
[query whereKey:@"location" withinGeoBoxFromSouthwest:southwestOfSF toNortheast:northeastOfSF];
NSArray<AVObject *> * pizzaPlacesInSF = [query findObjects];
```

注意事项
目前有几个需要注意的地方：

 * 每个AVObject数据对象中只能有一个AVGeoPoint对象。
 * 地理位置的点不能超过规定的范围。纬度的范围应该是在-90.0到90.0之间。经度的范围应该是在-180.0到180.0之间。如果您添加的经纬度超出了以上范围，将导致程序错误。
 * iOS 8.0 之后使用定位服务前需要调用 [locationManager requestWhenInUseAuthorization] 或者 [locationManager requestAlwaysAuthorization] 获取用户使用期授权或永久授权，而这两个请求授权需要在 info.plist 里面对应添加 NSLocationWhenInUseUsageDescription 或 NSLocationWhenInUseUsageDescription 的 key/value，value 为开启定位服务原因的描述，SDK 内部默认使用的是使用期授权。

## 调用云代码

### 调用云代码函数

使用`AVCloud`类的静态方法来调用云代码中定义的函数：


  NSDictionary *parameters=@{...};

    [AVCloud callFunctionInBackground:@"aFunctionName" withParameters:parameters block:^(id object, NSError *error) {
        // 执行结果
    }];


`aFunctionName`是函数的名称，`parameters`是传入的函数参数，`block`对象作为调用结果的回调传入。

### 区分生产环境调用

云代码区分测试和生成环境, 所以可以通过设置AVCloud来调用不同生成环境

  [AVCloud setProductionMode:NO];

其中`NO`表示测试环境. 默认是调用生产环境云代码.

## 短信验证码服务
除了用户相关的包括注册，登录等操作以外，LeanCloud还支持额外的短信验证码服务。
在实际的应用中，假如有一些相对比较敏感的操作，比如付费、删除重要资源等操作，您希望能够通过短信验证的方式来与用户进行确认，您就可以在用户验证过手机号码，应用管理平台打开了`启用帐号无关短信验证服务（针对 requestSmsCode 和 verifySmsCode 接口）`选项的前提下，使用LeanCloud提供的短信验证码服务。

### 请求短信验证码
以下操作为给某个操作发送验证短信

```objc
    [AVOSCloud requestSmsCodeWithPhoneNumber:@"13613613613"
                                     appName:@"某应用"
                                   operation:@"具体操作名称"
                                  timeToLive:10
                                    callback:^(BOOL succeeded, NSError *error) {
        // 执行结果
    }];
   //短信格式类似于：
   //您正在{某应用}中进行{具体操作名称}，您的验证码是:{123456}，请输入完整验证，有效期为:{10}分钟

```

### 自定义短信模板

如果您想完全自定义短信的内容，可以在应用设置的短信模板创建自定义的短信模板，但是需要**审核**。

在提交了短信模板并且得到审核以后，你可以通过SDK来发送符合短信模板的短信给你的用户。

假设您提交了如下的短信模板，并且将这个模板的名称保存为"Register_Template"：

<pre ng-non-bindable ><code>
Hi {{username}},
欢迎注册{{name}}应用，您可以通过验证码:{{code}}，进行注册。本条短信将在{{ttl}}分钟后自行销毁。请尽快使用。
以上。
{{appname}}
</code></pre>

**注：其中的name,code,ttl是预留的字段，分别代表应用名、验证码、过期时间。不需要填充内容，会自动填充。**

您可以通过如下代码进行短信发送：

```objc
    NSMutableDictionary *dict = [[NSMutableDictionary alloc] init];
    [dict setObject:@"MyName" forKey:@"username"];
    [dict setObject:@"MyApplication" forKey:@"appname"];
    [AVOSCloud requestSmsCodeWithPhoneNumber:@"12312312312" templateName:@"Register_Template" variables:dict callback:^(BOOL succeeded, NSError *error) {
        if (succeeded) {
            //do something
        } else {
            NSLog(@"%@", error);
        }
    }];
```

### 验证短信验证码
您可以通过以下代码来验证短信验证码：

```objc
    [AVOSCloud verifySmsCode:@"123456" callback:^(BOOL succeeded, NSError *error) {
        //code
    }];
```

## FAQ 常见问题和解答

### 怎么使用 LeanCloud iOS SDK
最简单的方式，使用CocoaPods，如以下的PodFile

```sh
pod 'AVOSCloud'
```

AVOSCloudSNS SDK:

```sh
pod 'AVOSCloudSNS'
```

### 如何使用用户登录功能

```objc
    [AVUser logInWithUsernameInBackground:@"zeng" password:@"123456" block:^(AVUser *user, NSError *error) {
        if (user != null) {
            NSLog(@"login success");
        } else {
            NSLog(@"signin failed");
        }
    }];

```


### 如何登出

```objc
[AVUser logOut];

```


### 如何使用新浪微博登录


```objc
[AVOSCloudSNS loginWithCallback:^(id object, NSError *error) {

  //callback code here

} toPlatform:AVOSCloudSNSSinaWeibo];

```

### 使用 AVOSCloudSNS，运行时报错：+[AVUser loginWithAuthData:block:]: unrecognized selector sent to class

请将 `Build Settings -> Linking -> Other Linker Flags` 设置为 `-ObjC`。具体原因可以参考苹果官方的 Technical Q&A QA1490 [Building Objective-C static libraries with categories](https://developer.apple.com/library/mac/qa/qa1490/_index.html)。此外，stackoverfow 也有一个比较详细的答案 [Objective-C categories in static library](http://stackoverflow.com/questions/2567498/objective-c-categories-in-static-library)。









