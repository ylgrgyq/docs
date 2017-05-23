# LiveQuery 开发指南

## 功能预览

![webm](images/live-query-preview.gif)

## 使用场景

- 多端数据同步
- 数据的实时展现
- 客户端与服务端之间的数据传递实现推拉结合

## 启用 LiveQuery

需要在控制台 -> 设置 -> 应用选项 -> 勾选 「启用 LiveQuery」才可以在 SDK 中创建和使用，否则会报错。

并且一定要在 SDK 中正确的初始化 LeanCloud 实时消息服务模块：

```objc
```
```java
```
```js
```
```cs
string appId = "uay57kigwe0b6f5n0e1d4z4xhydsml3dor24bzwvzr57wdap";
string appKey = "kfgz7jjfsk55r5a8a3y4ttd3je1ko11bkibcikonk32oozww";
Websockets.Net.WebsocketConnection.Link();
var realtime = new AVRealtime(appId, appKey);
AVRealtime.WebSocketLog(Console.WriteLine);
AVClient.HttpLog(Console.WriteLine);
```


请确保安装 SDK 的时候已经引入了实时通信服务的相关模块，详细请查询对应文档：

- [iOS SDK 安装指南 - 实时通信模块](sdk_setup-objc.html)
- [Android SDK 安装指南 - 实时通信模块](sdk_setup-android.html)
- [JavaScript SDK 安装指南 - 实时通信模块](sdk_setup-js.html)
- [C# SDK 安装指南 - 实时通信模块](sdk_setup-dotnet.html#_NET_Framework)
- [Unity SDK 安装指南 - 实时通信模块](sdk_setup-dotnet.html#Mono_for_Unity)

## 构建查询
LiveQuery 是基于 AVQuery 的查询条件来做到精准推送的，我们假设如下场景，现在要实现一个 Todo 的管理应用，我在网页上勾选一个已完成，手机上立刻同步这个操作，正如前文的功能预览界面里面的效果一样。

我们新建 2 个针对 Todo 的查询，一个查询的是正在进行中的，而另一个是查询已完成的：

```objc
```
```java
```
```js
```
```cs
// 正在进行中的 Todo
var doingQuery = new AVQuery<AVObject>("Todo").WhereEqualTo("state", "doing");
// 已完成的 Todo
var doneQuery = new AVQuery<AVObject>("Todo").WhereEqualTo("state", "done");
```

## 主动拉取
一般来说用户打开页面之后，客户端第一次需要主动执行一次查询，用来做列表展示：

```objc
```
```java
```
```js
```
```cs
// 假设 doingList 对应的是某一个列表控件绑定的数据源
var doingList = new List<AVObject>();
var doing = await doingQuery.FindAsync();
doingList = doing.ToList();
```

## 订阅数据变更 - 核心用法

LiveQuery 的核心用法就是定义了一个查询，然后我订阅符合这个查询条件的对象的变化，例如某一个 Todo （例如叫做购买移动电源）从正在进行变更为已完成，那么我的列表页需要作出如下两个动作：

第一，从正在进行的列表里面移除「购买移动电源」
第二，将「购买移动电源」添加到已完成

在有 LiveQuery 功能之前，我们需要通过客户端的定时拉取或者提醒用户主动刷新的方式来刷新客户端的数据展现，而有了 LiveQuery 之后，通过如下的订阅方式就可以依赖服务端发起的数据推送来刷新页面，而开发者的前端展示就减少许多提示或者是定时器的负担：

```objc
```
```java
```
```js
```
```cs
var livequery = await doingQuery.SubscribeAsync();
livequery.OnLiveQueryReceived += (sender, e) => 
{
    if(e.Scope == "create")
    {
        doingList.Add(e.Payload);
    }
};
```

请注意上述的关键代码是订阅操作：

```objc
```
```java
```
```js
```
```cs
var livequery = await doingQuery.SubscribeAsync();
```

开启订阅之后，符合查询条件的数据产生的变化类型有以下几种：

- `create`： 符合查询条件的对象创建
- `update`： 符合查询条件的对象属性修改。
- `enter` ： 对象修改事件，从不符合查询条件变成符合。
- `leave` ： 对象修改时间，从符合查询条件变成不符合。
- `delete`： 对象删除
- `login` ： 只对 _User 对象有效，表示用户登录

因此在得到 LiveQuery 的消息通知的时候一定要区分变化类型，例如 Todo 应用中在我们拿已完成的查询来做实例

### 新增一条未完成 - create

首先启动 app 之后，页面上已经显示了当前已完成的一些 Todo，当另一客户端恰巧在这个时候执行了如下代码添加一条全新的未完成的 Todo：

```objc
```
```java
```
```js
```
```cs
var testObj = new AVObject("Todo");
testObj["state"] = "doing";
await testObj.SaveAsync();
```
```curl
```

那么当前客户端就会接收到 `create` 的数据推送：

```objc
```
```java
```
```js
```
```cs
livequery.OnLiveQueryReceived += (sender, e) => 
{
    if(e.Scope == "create")
    {
        doingList.Add(e.Payload);
    }
};
```

### 标题修改 - update
我们订阅了未完成的 Todo，但是在另一端某一条未完成的标题修改了，但是他仍然处于未完成状态，状态(state)字段并未修改，因此不影响它依然属于符合订阅的查询条件，修改标题的代码如下：


```objc
```
```java
```
```js
```
```cs
// 假设有一条未完成的 Todo 的 objectId 5915bb92a22b9d005804a4ee
var oneDoing = AVObject.CreateWithoutData("Todo", "5915bb92a22b9d005804a4ee");
oneDoing["title"] = "修改标题";
await oneDoing.SaveAsync();
```
```curl
```

在当前客户端需要如下做就可以监听 `update` 类型的数据推送：

```objc
```
```java
```
```js
```
```cs
livequery.OnLiveQueryReceived += (sender, e) => 
{
    if(e.Scope == "update")
    {
        foreach(var key in e.Keys)
        {
            // 变更的列名
            if(key == "title")
            {
                // 获取对应的标题
                var title = e.Payload.Get<string>(key);
            }
        }
    }
};
```

### 已完成转为未完成 - enter 
另一端将一条**已完成**修改为**未完成**，代码如下：

```objc
```
```java
```
```js
```
```cs
// 假设有一条已完成的 objectId 591672df2f301e006b9b2829 
var anotherDone = AVObject.CreateWithoutData("Todo", "591672df2f301e006b9b2829");
anotherDone["state"] = "doing";
await anotherDone.SaveAsync();
```
```curl
```

在当前客户端需要如下做就可以监听 `enter` 类型的数据推送：

```objc
```
```java
```
```js
```
```cs
livequery.OnLiveQueryReceived += (sender, e) => 
{
    if (e.Scope == "enter")
    {
      doingList.Add(e.Payload);
    }
};
```

请一定区分 `create` 和 `enter` 的行为：

 - `create`：对象从无到创建，并且符合查询条件
 - `enter` ：对象原来就存在，但是修改之前不符合查询条件，修改之后符合了查询条件


### 未完成标记为已完成 - leave 

另一端将一条**未完成**修改为**已完成**，代码如下：

```objc
```
```java
```
```js
```
```cs
var willDone = AVObject.CreateWithoutData("Todo", "591672df2f301e006b9b2829");
willDone["state"] = "done";
await willDone.SaveAsync();
```
```curl
```

与 `enter` 相反，当对象从符合条件变为不符合条件的时候，LiveQuery 会得到一条数据推送：

```objc
```
```java
```
```js
```
```cs
livequery.OnLiveQueryReceived += (sender, e) => 
{
    if(e.Scope == "leave")
    {
        var done = doingList.First(todo => todo.ObjectId == e.Payload.ObjectId);
        if(done != null)
        {
            doingList.Remove(done);
        }
    }
}
```


### 删除一个符合查询的对象 - delete

另一端将一条**未完成**直接删除，代码如下：

```objc
```
```java
```
```js
```
```cs
var willDelete = AVObject.CreateWithoutData("Todo", "591d9b302f301e006be22c83");
await willDelete.DeleteAsync();
```
```curl
```

LiveQuery 会得到一条数据推送：

```objc
```
```java
```
```js
```
```cs
livequery.OnLiveQueryReceived += (sender, e) => 
{
    if(e.Scope == "delete")
    {
        var done = doingList.First(todo => todo.ObjectId == e.Payload.ObjectId);
        if(done != null)
        {
            doingList.Remove(done);
        }
    }
}
```

### 针对用户(_User)的特殊事件 - login
LiveQuery 针对 _User 表做了一个特殊的功能，可以使用 LiveQuery 订阅用户的登录行为，例如你需要实现一个社交应用，而你正在使用内置的 _User 表管理用户，那么就可以使用 LiveQuery 来实时订阅其他用户的登录行为，使用的常见场景有：

- AVUser 的单点登录实现
- 订阅附近 5 公里的用户登录
- 实现好友登录的弹窗通知

```objc
```
```java
```
```js
```
```cs
var userQuery = new AVQuery<AVUser>();
var userLiveQuery = await userQuery.SubscribeAsync();
userLiveQuery.OnLiveQueryReceived += (sender, e) => 
{
    if(e.Scope == "login")
    {
        var user = e.Payload as AVUser;
    }
};
```

## LiveQuery 服务的时序图

![livequery-seq](images/livequery-seq.svg)


## 常见问题

- LiveQuery 与实时通信有什么关系？

  LiveQuery 只是与实时通信的聊天服务共用 WebSocket 通道，互相之间没有任何逻辑粘连。

- LiveQuery 有什么容易产生误解的用法？

  因为 LiveQuery 的实时性，很多用户会陷入一个误区，试着用 LiveQuery 来实现一个简单的聊天功能，我们十分不建议如此做，因为 LeanCloud 已经提供了实时通信的服务，LiveQuery 的核心还是提供一个针对查询的推拉结合的用法，脱离设计初衷容易造成前端的模块混乱。




