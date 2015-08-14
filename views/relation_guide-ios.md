{% extends "./relation_guide.tmpl" %}

{% block pointerOneToOneSave %}
```objc
    AVObject *post = [AVObject objectWithClassName:@"Post"];
    [post setObject:[AVUser currentUser] forKey:@"createdBy"];
```
{% endblock %}

{% block pointerOneToOneQuery %}
```objc
    AVQuery *postQuery = [AVQuery queryWithClassName:@"Post"];
    [postQuery whereKey:@"createdBy" equalTo:[AVUser currentUser]];
```
{% endblock %}

{% block pointerOneToOneGet %}
```objc
    AVUser *createdBy = [post objectForKey:@"createdBy"];
```
{% endblock %}

{% block avobjectArraySave %} 
```objc
    // 假设我们有四件商品
    AVObject *coffee;
    AVObject *chip;
    AVObject *beer;
    AVObject *cookie;
    
    // 将商品保存在数组中
    NSArray *products = @[coffee, chip, beer, cookie];
    
    // 将商品保存在用户的购物车中
    [[AVUser currentUser] setObject:products forKey:@"cartProducts"];
```
{% endblock %}

{% block avobjectArrayGet %}
```objc
    NSArray *products = [[AVUser currentUser] objectForKey:@"cartProducts"];
```
{% endblock %}

{% block relatedClassQueryFrom %}
```objc
    // 对 MemberRelation 表创建一个查询
    AVQuery *query = [AVQuery queryWithClassName:@"MemberRelation"];
    [query whereKey:@"member" equalTo:[AVUser currentUser]];
    
    // 执行查询
    [query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
        for(AVObject *o in objects) {
            // o 是 MemberRelation 表的一条记录
            // 获取当前用户所在班级
            AVObject *cls = [o objectForKey:@"class"];
            
            // 获取当前用户在班级里的角色
            NSString *role = [o objectForKey:@"role"];
        }
    }];
```
{% endblock %}

{% block avobjectArrayQueryIncludeKey %}
```objc
    // 从 AVUser 对象获得 AVQuery 对象
    AVQuery *userQuery = [AVUser query];
    
    // 为查询设置约束
    // 比如，你想查询最近一个小时登录过的用户
    
    // 让这个查询得到用户的同时，得到他们购物车上的商品列表
    [userQuery includeKey:@"cartProducts"];
    
    // 执行查询
    [userQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
        // objects 包含了所有满足条件的用户，和与之关联购物车商品列表
    }];
```
{% endblock %}

{% block avobjectArrayQueryContainedIn %}
```objc
    // 加上约束，查询购物车里有某个特定的商品的用户
    [userQuery whereKey:@"cartProducts" equalTo:coffee];
    
    // 或者查询购物车中包含了几个商品的用户
    [userQuery whereKey:@"cartProducts" containedIn:arrayOfProducts];
```
{% endblock %}

{% block avrelationSave %}
```objc
    // 假如我们用下面的对象来表示几个歌手
    AVObject *artistOne;
    AVObject *artistTwo;
    AVObject *artistThree;
    
    // 创建一条歌曲记录
    AVObject *song= [AVObject objectWithClassName:@"Song"];
    
    // 我们把歌手和歌曲关联起来，在 Song 对象中创建一个 "artists" Relation
    AVRelation *relation = [song relationforKey:@"artists"];
    // 请确保这些对象在关联之前已经保存到了服务器上
    [relation addObject:artistOne];
    [relation addObject:artistTwo];
    [relation addObject:artistThree];
    
    // 保存 Song 对象
    [song saveInBackground];
```
{% endblock %}

{% block avrelationQuery %}
```objc
    // 假如有一个 song 对象
    AVObject *song;
    
    // 在 artists 字段上得到一个 relation
    AVRelation *relation = [song relationforKey:@"artists"];
    
    // 根据上面的 relation 得到一个 AVQuery 对象
    AVQuery *query = [relation query];
    
    // 执行查询
```
{% endblock %}

{% block avrelationQueryEqualTo %}
```objc
    // 假如我们有一个 artist 对象，希望获得该 artist 创作的所有歌曲
    AVObject *artist;
    
    // 首先，对 Song 对象创建一个查询
    AVQuery *query = [AVQuery queryWithClassName:@"Song"];
    
    // 我们查询所有的 Song，看哪些 Song 的 artists 关联包含了特定的 artist
    [query whereKey:@"artists" equalTo:artist];
```
{% endblock %}

{% block relatedClassSave %}
```objc
    // 假定我们有一个即将要加入的班级
    AVObject *cls;
    
    // 在表中创建一条记录
    AVObject *memberRelation = [AVObject objectWithClassName:@"MemberRelation"];
    [memberRelation setObject:cls  forKey:@"class"];
    [memberRelation setObject:[AVUser currentUser] forKey:@"member"];
    [memberRelation setObject:@"leader" forKey:@"role"];
    [memberRelation saveInBackground];
```
{% endblock %}

{% block relatedClassQueryTo %} 
```objc
    AVObject *cls;
    
    // 对 MemberRelation 表创建一个查询
    AVQuery *query = [AVQuery queryWithClassName:@"MemberRelation"];
    [query whereKey:@"class" equalTo:cls];
    
    // 执行查询
    [query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
        for(AVObject *o in objects) {
            // o 是 MemberRelation 表的一条记录
            // 获取相应的班级成员
            AVUser *member = [o objectForKey:@"member"];
            
            // 获取该成员在班级里的角色
            NSString *role = [o objectForKey:@"role"];
        }
    }];
```
{% endblock %}

{% block avobjectArrayManyToManySave %} 
```objc
    // 假设我们有一个歌手
    AVObject *artist;
    
    // 假设我们也有一首歌曲
    AVObject *song;
    
    // 把相应的歌手加到 song 的 artists 数组中
    [song addObject:artist forKey:@"artists"];
```
{% endblock %}

{% block avobjectArrayManyToManyQuery %}
```objc
    // 对 Song 表创建一个查询
    AVQuery *songQuery = [AVQuery queryWithClassName:@"Song"];
    
    // 设置约束
    // 让查询同时返回每个 Song 中的 artists 列表
    [songQuery includeKey:@"artists"];
    
    // 执行查询
    [songQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
        // objects 是所有 Song 对象，同时包含了关联的 Artist 对象
    }];
```
{% endblock %}

{% block avobjectArrayManyToManyGet %} 
```objc
    NSArray *artistList = [song objectForKey:@"artists"];
```
{% endblock %}

{% block avobjectArrayManyToManyQueryEqualTo %}
```objc
    // 假如我们有一个 artist 对象
    AVObject *artist;
    
    // 对 Song 表创建一个查询
    AVQuery *songQuery = [AVQuery queryWithClassName:@"Song"];
    
    // 约束查询
    [songQuery whereKey:@"artists" equalTo:artist];
    
    // 让查询同时返回 artists 列表
    [songQuery includeKey:@"artists"];
    
    // 执行查询
    [songQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
        // objects 是所有 Song 对象，同时包含了关联的 Artist 对象
    }];
```
{% endblock %}
