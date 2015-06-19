{% extends "./relation_guide.tmpl" %}

{% block docTitle %}
# iOS 关系建模指南
{% endblock %}

{% block postPointToAVUser %}

```objc
AVObject *post= [AVObject objectWithClassName:@"Post"];
[post setObject:[AVUser currentUser] forKey:@"potedBy"];
```
{% endblock %}

{% block queryPostByAVUser %}

```objc
AVQuery *postQuery = [AVQuery queryWithClassName:@"Post"];
[postQuery whereKey:@"potedBy" equalTo:[AVUser currentUser]];
```
{% endblock %}


{% block queryCreaterForPost %}

```objc
// 假定我们已经从服务端 fetch 了一个 Post 对象
AVObject *post = ...
 
// 获取 Post 的发送者
AVUser *postedBy = [post objectForKey@"postedBy"];
```
{% endblock %}

{% block addTopicListToAVUser %}

```objc
// 新建一些话题对象
AVObject *nba = ...
AVObject *warcraft = ...
AVObject *dota2 = ...
AVObject *show = ...
 
// 把这些话题对象都放到一个数组里面
NSArray *topics = @[nba, warcraft, dota2, show];
 
// 将话题数组直接保存在 AVUser 的一个属性中
[[AVUser currentUser] setObject:topics forKey:@"topicList"];
```
{% endblock %}

{% block getTopicListFromAVUser %}

```objc
NSArray *topics = [[AVUser currentUser] objectForKey:@"topicList"];
```
{% endblock %}

{% block queryIncludeTopicList %}

```objc
// 新建一个 AVQuery 对象用来查询 AVUser
AVQuery *userQuery = [AVUser query];
 
// 在这里可以构建一个有效的查询
// 比如你可以查询所有在 2015年6月9号注册的微博用户
 
// 然后调用 AVQuery includeKey 的方法，明确告知服务端本次查询要求返回 topicList 里面的内容
[userQuery includeKey:@"topicList"];
 
// 执行查询
[userQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
    // objects 就是查询 AVUser 的集合
    // 它的包含的每一个 AVUser 在 topicList 字段上都有对应的值
}];
```
{% endblock %}


{% block queryAVUserContainsTopic %}
```objc
// 构建一个关注了 nba 话题的查询，用来查询符合条件的 AVUser
[userQuery whereKey:@"topicList" equalTo:nba];
 
// 或者使用包含查询也可以实现等同的效果
[userQuery whereKey:@"topicList" containedIn:arrayOfTopics];
```
{% endblock %}

{% block studentAVRelationCourse %}

以下代码是实现 Book 和 Author 之间的关系的，请替换成实现 学生和课程 之间的关系的代码。注释请注意替换。

```objc
// let’s say we have a few objects representing Author objects
AVObject *authorOne = …
AVObject *authorTwo = …
AVObject *authorThree = …

// now we create a book object
AVObject *book= [AVObject objectWithClassName:@"Book"];
 
// now let’s associate the authors with the book
// remember, we created a "authors" relation on Book
AVRelation *relation = [book relationforKey:@"authors"];
// make sure these objects should be saved to server before adding to relation
[relation addObject:authorOne];
[relation addObject:authorTwo];
[relation addObject:authorThree];
 
// now save the book object
[book saveInBackground];
```

** 注意： ** 这里 authorOne, authorTwo, authorThree 必需已经保存到云端之后才能添加到 relation，否则 [book saveInBackground] 会报错。
{% endblock %}

{% block queryStudentByCourse %}

```objc
// suppose we have a book object
AVObject *book = ...
 
// create a relation based on the authors key
AVRelation *relation = [book relationforKey:@"authors"];
 
// generate a query based on that relation
AVQuery *query = [relation query];
 
// now execute the query
```
{% endblock %}

{% block queryCoursesByStudent %}

```objc
// suppose we have a author object, for which we want to get all books
AVObject *author = ...
 
// first we will create a query on the Book object
AVQuery *query = [AVQuery queryWithClassName:@"Book"];
 
// now we will query the authors relation to see if the author object 
// we have is contained therein
[query whereKey:@"authors" equalTo:author];
```
{% endblock %}

{% block  relationTableStudentCourse%}

```objc
// suppose we have a user we want to follow
AVUser *otherUser = ...
 
// create an entry in the Follow table
AVObject *follow = [AVObject objectWithClassName:@"Follow"];
[follow setObject:[AVUser currentUser]  forKey:@"from"];
[follow setObject:otherUser forKey:@"to"];
[follow setObject:[NSDate date] forKey:@"date"];
[follow saveInBackground];
```
{% endblock %}

{% block relationTableQueryStudentInCourse %}

```objc
// set up the query on the Follow table
AVQuery *query = [AVQuery queryWithClassName:@"Follow"];
[query whereKey:@"from" equalTo:[AVUser currentUser]];
 
// execute the query
[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  for(AVObject *o in objects) {
    // o is an entry in the Follow table
    // to get the user, we get the object with the to key
    AVUser *otherUser = [o objectForKey:@"to"];
 
    // to get the time when we followed this user, get the date key
    NSDate *when = [o objectForKey:@"date"];
  }
}];
```
{% endblock %}

{% block relationTableQueryCourseOfStudent %}

```objc
// set up the query on the Follow table
AVQuery *query = [AVQuery queryWithClassName:@"Follow"];
[query whereKey:@"to" equalTo:[AVUser currentUser]];
 
// execute the query
[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  for(AVObject *o in objects) {
    // o is an entry in the Follow table
    // to get the user, we get the object with the from key
    AVUser *otherUser = [o objectForKey:@"from"];
 
    // to get the time the user was followed, get the date key
    NSDate *when = [o objectForKey:@"date"];
  }
}];
```

{% endblock %}

{% block addFocusTagsForAVUserUsingArray %}

```objc
// let's say we have an author
AVObject *author = ...
 
// and let's also say we have an book
AVObject *book = ...
 
// add the author to the authors list for the book
[book addObject:author forKey:@"authors"];
```
{% endblock %}


{% block queryFocusTagsForAVUserUsingInclude %}

```objc
// set up our query for the Book object
AVQuery *bookQuery = [AVQuery queryWithClassName:@"Book"];
 
// configure any constraints on your query...
// tell the query to fetch all of the Author objects along with the Book
[bookQuery includeKey:@"authors"];
 
// execute the query
[bookQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
    // objects is all of the Book objects, and their associated 
    // Author objects, too
}];
```
{% endblock %}

{% block queryAVUserFocusHotTag %}

```objc
// suppose we have an Author object
AVObject *author = ...
 
// set up our query for the Book object
AVQuery *bookQuery = [AVQuery queryWithClassName:@"Book"];
 
// configure any constraints on your query...
[bookQuery whereKey:@"authors" equalTo:author];
 
// tell the query to fetch all of the Author objects along with the Book
[bookQuery includeKey:@"authors"];
 
// execute the query
[bookQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
    // objects is all of the Book objects, and their associated Author objects, too
}];
```

{% endblock %}
