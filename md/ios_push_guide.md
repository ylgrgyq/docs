# iOS 消息推送开发指南

> 开始之前
> 在看下面的内容之前，我们假设你已经看过我们的[消息推送开发总览](./push_guide.html)，了解了基本的概念和模型。

本节将向你简单介绍如何在 iOS 设备中使用 LeanCloud 的推送功能（如果你对 iOS 消息推送还不太了解，推荐先看我们的博客文章：[细说 iOS 消息推送](https://blog.leancloud.cn/1163/)）。

## 文档贡献

如果觉得这个文档写的不够好，也可以帮助我们来不断完善。

Github 仓库地址：[https://github.com/leancloud/docs](https://github.com/leancloud/docs)


## 配置 iOS 推送证书

配置 iOS 证书相对麻烦，但是却是必须的步骤，请仔细看[iOS推送证书设置指南](./ios_push_cert.html)。


## 保存 Installation

在保存 installation 前，要先通过下列代码获取用户推送权限：

```objc
// Before iOS 8:
- (BOOL)application:(UIApplication *)application
didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    ...
    // Register for push notifications
    [application registerForRemoteNotificationTypes:
                                UIRemoteNotificationTypeBadge |
                                UIRemoteNotificationTypeAlert |
                                UIRemoteNotificationTypeSound];
    ...
}
```

```objc
//For iOS 8:
- (BOOL)application:(UIApplication *)application
didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    ...
    UIUserNotificationSettings *settings = [UIUserNotificationSettings settingsForTypes:UIUserNotificationTypeAlert
                                            | UIUserNotificationTypeBadge
                                            | UIUserNotificationTypeSound
                                                                             categories:nil];
    [application registerUserNotificationSettings:settings];
    [application registerForRemoteNotifications];
    ...
}
```

在 iOS 设备中，Installation 的类是 AVInstallation，并且是 AVObject 的子类，使用同样的 API 存储和查询。如果要访问当前应用的 Installation 对象，可以通过`[AVInstallation currentInstallation]`方法。当你第一次保存 AVInstallation 的时候，它会插入`_Installation`表，你可以在[数据管理](/data.html?appid={{appid}})平台看到和查询。当 deviceToken 一被保存，你就可以向这台设备推送消息了。

```objc
- (void)application:(UIApplication *)app didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
    AVInstallation *currentInstallation = [AVInstallation currentInstallation];
    [currentInstallation setDeviceTokenFromData:deviceToken];
    [currentInstallation saveInBackground];
}
```

可以像修改 AVObject 那样去修改 AVInstallation，但是有一些特殊字段可以帮你管理目标设备：

* badge 应用 icon 旁边的红色数字，修改 AVInstallation 的这个值将修改应用的 badge。修改应该保存到服务器，以便为以后做 badge 增量式的推送做准备。
* channels 当前设备订阅的频道数组。
* appName 应用名称，只读
* appVersion 应用版本，只读

## 发送推送消息

发送 iOS 推送消息，可以通过 REST API，或者我们的消息推送 web 平台，请进入你的应用管理界面查看。

## 使用频道

使用频道可以实现发布——订阅的模型。设备订阅某个频道，然后发送消息的时候指定要发送的频道即可。

### 订阅和退订

订阅"Giants"频道：

```objc
// When users indicate they are Giants fans, we subscribe them to that channel.
AVInstallation *currentInstallation = [AVInstallation currentInstallation];
[currentInstallation addUniqueObject:@"Giants" forKey:@"channels"];
[currentInstallation saveInBackground];
```

订阅后要记得保存，即可在[数据管理](/data.html?appid={{appid}})平台看到该installation的channels字段多了"Giants"。

退订：

```objc
// When users indicate they are no longer Giants fans, we unsubscribe them.
AVInstallation *currentInstallation = [AVInstallation currentInstallation];
[currentInstallation removeObject:@"Giants" forKey:@"channels"];
[currentInstallation saveInBackground];
```

获取所有订阅的频道：

```objc
NSArray *subscribedChannels = [AVInstallation currentInstallation].channels;
```

### 发送消息到频道

例如，发送消息到刚才订阅的"Giants"频道：

```objc
// Send a notification to all devices subscribed to the "Giants" channel.
AVPush *push = [[AVPush alloc] init];
[push setChannel:@"Giants"];
[push setMessage:@"The Giants just scored!"];
[push sendPushInBackground];
```

如果你想发送到多个频道，可以指定 channels 数组:

```objc
NSArray *channels = [NSArray arrayWithObjects:@"Giants", @"Mets", nil];
AVPush *push = [[AVPush alloc] init];

// Be sure to use the plural 'setChannels'.
[push setChannels:channels];
[push setMessage:@"The Giants won against the Mets 2-3."];
[push sendPushInBackground];
```

### 选择证书

默认情况下，从客户端发起的推送都是使用你在消息菜单上传的生产证书，如果想使用测试证书，可以通过 `setProductionMode`方法：

```
[AVPush setProductionMode:NO];
......
```


## 高级定向发送

频道对于大多数应用来说可能就足够了。但是某些情况下，你可能需要更高精度的定向推送。LeanCloud 允许你通过 AVQuery API 查询 Installation 列表，并向指定条件的 query 推送消息。

因为 AVInstallation 同时是 AVObject 的子类，因此你可以保存任何数据类型到 AVInstallation，并将它和你的其他应用数据对象关联起来，这样以来，你可以非常灵活地向你用户群做定制化、动态的推送。

### 保存 Installation 数据

为 AVInstallation 添加三个新字段：

```objc
// Store app language and version
AVInstallation *installation = [AVInstallation currentInstallation];
[installation setObject:@(YES) forKey:@"scores"];
[installation setObject:@(YES) forKey:@"gameResults"];
[installation setObject:@(YES) forKey:@"injuryReports"];
[installation saveInBackground];
```

表示比赛的分数，比赛结果和受伤报告。

设置，你可以给 Installation 添加 owner 属性，比如当前的登陆用户：

```objc
// Saving the device's owner
AVInstallation *installation = [AVInstallation currentInstallation];
[installation setObject:[AVUser currentUser] forKey:@"owner"];
[installation saveInBackground];
```

### 根据查询来推送消息

一旦 Installation保存了你的应用数据，你可以使用`AVQuery`来查询出设备的一个子集做推送。Installation 的查询跟其他对象的查询没有什么不同，只是使用特殊的静态方法
`[AVInstallation query]`创建查询对象：

```objc
// Create our Installation query
AVQuery *pushQuery = [AVInstallation query];
[pushQuery whereKey:@"injuryReports" equalTo:@(YES)];

// Send push notification to query
AVPush *push = [[AVPush alloc] init];
[push setQuery:pushQuery]; // Set our Installation query
[push setMessage:@"Willie Hayes injured by own pop fly."];
[push sendPushInBackground];
```

你也可以在查询中添加 channels 的条件：

```objc
// Create our Installation query
AVQuery *pushQuery = [AVInstallation query];
[pushQuery whereKey:@"channels" equalTo:@"Giants"]; // Set channel
[pushQuery whereKey:@"scores" equalTo:@(YES)];

// Send push notification to query
AVPush *push = [[AVPush alloc] init];
[push setQuery:pushQuery];
[push setMessage:@"Giants scored against the A's! It's now 2-2."];
[push sendPushInBackground];
```

如果你在 Installation 还保存了其他对象的关系，我们同样可以在查询条件中使用这些数据，例如，向靠近北京大学的设备推送消息：

```objc
// Find users near a given location
AVQuery *userQuery = [AVUser query];
[userQuery whereKey:@"location"
        nearGeoPoint:beijingUniversityLocation,
         withinMiles:[NSNumber numberWithInt:1]]

// Find devices associated with these users
AVQuery *pushQuery = [AVInstallation query];
[pushQuery whereKey:@"user" matchesQuery:userQuery];

// Send push notification to query
AVPush *push = [[AVPush alloc] init];
[push setQuery:pushQuery]; // Set our Installation query
[push setMessage:@"Free hotdogs at the AVOSCloud concession stand!"];
[push sendPushInBackground];
```

## 发送选项

除了发送一个文本信息之外，你还可以播放一个声音，设置 badge 数字或者其他想自定义的数据。你还可以设置一个消息的过期时间，如果对消息的时效性特别敏感的话。

### 定制通知

如果你不仅想发送一条文本消息，你需要一个 NSDictionary 来打包想发送的数据。这里有一些保留字段有特殊含义需要说明下：

* alert: 推送消息的文本内容
* badge: (iOS only) app icon 右上角的数字。可以设置一个值或者递增当前值。
* sound: (iOS only) 应用 bundle 里的声音文件名称。
* content-available: (iOS only) 如果你在使用 Newsstand, 设置为 1 来开始一次后台下载。
* action: (Android only) 当消息收到的时候，触发的 Intent 名称。如果没有设置 title 或者 alert，Intent 将触发，但是不会显示通知给用户。
* title: (Android only) 显示在系统通知栏的标题。


例如，递增 badge 数字，并播放声音可以这样做:

```objc
NSDictionary *data = [NSDictionary dictionaryWithObjectsAndKeys:
    @"The Mets scored! The game is now tied 1-1!", @"alert",
    @"Increment", @"badge",
    @"cheering.caf", @"sound",
    nil];
AVPush *push = [[AVPush alloc] init];
[push setChannels:[NSArray arrayWithObjects:@"Mets", nil]];
[push setData:data];
[push sendPushInBackground];
```

当然，你还可以添加其他自定义的数据。你会在接收推送一节看到，当应用通过推送打开你的应用的时候，你就可以访问这些数据。当你要在用户打开通知的时候显示一个不同的 view controller 的时候，这特别有用。

```objc
NSDictionary *data = [NSDictionary dictionaryWithObjectsAndKeys:
    @"Ricky Vaughn was injured in last night's game!", @"alert",
    @"Vaughn", @"name",
    @"Man bites dog", @"newsItem",
    nil];
AVPush *push = [[AVPush alloc] init];
[push setQuery:injuryReportsQuery];
[push setChannel:@"Indians"];
[push setData:data];
[push sendPushInBackground];
```


### 设置过期日期

当设备关闭或者无法连接到网络的时候，推送通知就无法被送达。如果你有一条时间敏感的推送通知，不希望在太长时间后被用户读到，那么可以设置一个过期时间来避免打扰用户。

AVPush 提供了两个方法来设置通知的过期日期，首先是 expireAtDate：接收 NSDate 来告诉 LeanCloud 不要再去发送通知。

```objc
NSDateComponents *comps = [[NSDateComponents alloc] init];
[comps setYear:2013];
[comps setMonth:10];
[comps setDay:12];
NSCalendar *gregorian =
  [[NSCalendar alloc] initWithCalendarIdentifier:NSGregorianCalendar];
NSDate *date = [gregorian dateFromComponents:comps];

// Send push notification with expiration date
AVPush *push = [[AVPush alloc] init];
[push expireAtDate:date];
[push setQuery:everyoneQuery];
[push setMessage:@"Season tickets on sale until October 12th"];
[push sendPushInBackground];
```

这个方法有个隐患，因为设备的时钟是无法保证精确的，你可能得到错误的结果。因此，AVPush 还提供了 expireAfterTimeInterval 方法，接收 NSTimeInterval 对象。通知将在指定间隔时间后失效：

```objc
// Create time interval
NSTimeInterval interval = 60*60*24*7; // 1 week

// Send push notification with expiration interval
AVPush *push = [[AVPush alloc] init];
[push expireAfterTimeInterval:interval];
[push setQuery:everyoneQuery];
[push setMessage:@"Season tickets on sale until October 18th"];
[push sendPushInBackground];
```

**我们建议给 iOS 设备的推送都设置过期时间，才能保证推送的当时，如果用户设置了飞行模式，在关闭飞行模式之后可以收到推送消息，参考这个[帖子](http://stackoverflow.com/questions/24026544/push-notification-is-not-being-delivered-when-iphone-comes-back-online)**

### 指定设备平台

跨平台的应用，可能想指定发送的平台，比如 iOS 或者 Android:

```objc
AVQuery *query = [AVInstallation query];
[query whereKey:@"channels" equalTo:@"suitcaseOwners"];

// Notification for Android users
[query whereKey:@"deviceType" equalTo:@"android"];
AVPush *androidPush = [[AVPush alloc] init];
[androidPush setMessage:@"Your suitcase has been filled with tiny robots!"];
[androidPush setQuery:query];
[androidPush sendPushInBackground];

// Notification for iOS users
[query whereKey:@"deviceType" equalTo:@"ios"];
AVPush *iOSPush = [[AVPush alloc] init];
[iOSPush setMessage:@"Your suitcase has been filled with tiny apples!"];
[iOSPush setChannel:@"suitcaseOwners"];
[iOSPush setQuery:query];
[iOSPush sendPushInBackground];
```

## 定时推送

请进入消息推送的 web 管理平台，可以做到定时推送（延迟或者指定时间）。


## 接收推送通知

正如前面定制通知一节提到，你可以随通知发送任意的数据。我们使用这些数据修改应用的行为，当应用是通过通知打开的时候。例如，当打开一条通知告诉你有一个新朋友的时候，这时候如果显示一张图片会非常好。

由于 Apple 的对消息大小的限制，请尽量缩小要发送的数据大小，否则可能被截断：

```objc
NSDictionary *data = @{
  @"alert": @"James commented on your photo!",
  @"p": @"vmRZXZ1Dvo" // Photo's object id
};
AVPush *push = [[AVPush alloc] init];
[push setQuery:photoOwnerQuery];
[push setData:data];
[push sendPushInBackground];
```

## 响应通知数据

当应用是被通知打开的时候，, 你可以通过`application:didFinishLaunchingWithOptions: `方法的 launchOptions dictionary 访问到数据：

```objc
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  . . .
  // Extract the notification data
  NSDictionary *notificationPayload = launchOptions[UIApplicationLaunchOptionsRemoteNotificationKey];

  // Create a pointer to the Photo object
  NSString *photoId = [notificationPayload objectForKey:@"p"];
  AVObject *targetPhoto = [AVObject objectWithoutDataWithClassName:@"Photo"
                                                          objectId:photoId];

  // Fetch photo object
  [targetPhoto fetchIfNeededInBackgroundWithBlock:^(AVObject *object, NSError *error) {
    // Show photo view controller
    if (!error && [AVUser currentUser]) {
      PhotoVC *viewController = [[PhotoVC alloc] initWithPhoto:object];
      [self.navController pushViewController:viewController animated:YES];
    }
  }];
}
```

如果当通知到达的时候，你的应用已经在运行，那么你可以通过`application:didReceiveRemoteNotification:fetchCompletionHandler:`方法的 userInfo dictionary 访问到数据：

```objc
- (void)application:(UIApplication *)application
      didReceiveRemoteNotification:(NSDictionary *)userInfo
            fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))handler {
  // Create empty photo object
  NSString *photoId = [userInfo objectForKey:@"p"];
  AVObject *targetPhoto = [AVObject objectWithoutDataWithClassName:@"Photo"
                                                          objectId:photoId];

  // Fetch photo object
  [targetPhoto fetchIfNeededInBackgroundWithBlock:^(AVObject *object, NSError *error) {
    // Show photo view controller
    if (error) {
      handler(UIBackgroundFetchResultFailed);
    } else if ([AVUser currentUser]) {
      PhotoVC *viewController = [[PhotoVC alloc] initWithPhoto:object];
      [self.navController pushViewController:viewController animated:YES];
    } else {
      handler(UIBackgroundModeNoData);
    }
  }];
}
```


你可以阅读[Apple本地化和推送的文档](https://developer.apple.com/library/ios/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/Introduction.html#//apple_ref/doc/uid/TP40008194-CH1-SW1)来更多地了解推送通知。

## 跟踪推送和应用的打开情况

通过 AVAnalytics 你可以跟踪通知和应用的打开情况。添加下列代码到上面例子中的`application:didFinishLaunchingWithOptions: `方法来收集打开信息：

```objc
if (application.applicationState != UIApplicationStateBackground) {
  // Track an app open here if we launch with a push, unless
  // "content_available" was used to trigger a background push (introduced
  // in iOS 7). In that case, we skip tracking here to avoid double
  // counting the app-open.
  BOOL preBackgroundPush = ![application respondsToSelector:@selector(backgroundRefreshStatus)];
  BOOL oldPushHandlerOnly = ![self respondsToSelector:@selector(application:didReceiveRemoteNotification:fetchCompletionHandler:)];
  BOOL noPushPayload = ![launchOptions objectForKey:UIApplicationLaunchOptionsRemoteNotificationKey];
  if (preBackgroundPush || oldPushHandlerOnly || noPushPayload) {
    [AVAnalytics trackAppOpenedWithLaunchOptions:launchOptions];
  }
}
```


传递 nil 或者空白的参数给`trackAppOpenedWithLaunchOptions:`方法只是统计一次标准的应用打开事件 (比如不是通过通知打开的应用）。

你可以在[请求分析](/apistat.html?appid={{appid}}#/_apiRequest)菜单里看到通知和 app 的打开情况。

请注意，如果你的应用正在运行或者在后台，`application:didReceiveRemoteNotification:`方法将会处理收到的推送通知。

***如果你的应用处于运行状态，iOS 系统将不会在系统的通知中心显示推送消息，你可以使用`UILocalNotification`展示一个通知给用户。***

如果应用在后台，并且用户点击了通知，那么应用将被带到前台可视，为了跟踪这种通过通知打开应用的情况，你需要在跟踪代码里多作一个检查：

```objc
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo {
  if (application.applicationState == UIApplicationStateActive) {
    // 此处可以写上应用激活状态下接收到通知的处理代码，如无需处理可忽略
  } else {
    // The application was just brought from the background to the foreground,
    // so we consider the app as having been "opened by a push notification."
    [AVAnalytics trackAppOpenedWithRemoteNotificationPayload:userInfo];
  }
}
```
如果使用 iOS 7 push 的新特性（包括新的"content-available" 功能），你需要实现 iOS 7 新加的方法：
```objc
- (void)application:(UIApplication *)application
        didReceiveRemoteNotification:(NSDictionary *)userInfo
        fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
  if (application.applicationState == UIApplicationStateActive) {
    // 此处可以写上应用激活状态下接收到通知的处理代码，如无需处理可忽略
  } else {
    [AVAnalytics trackAppOpenedWithRemoteNotificationPayload:userInfo];
  }
}
```

### 跟踪本地通知 (iOS only)

为了统计跟踪本地通知消息，需要注意`application:didFinishLaunchingWithOptions:`和`application:didReceiveLocalNotification:`都会调用到，如果你实现了`application:didReceiveLocalNotification:`这个方法,要注意避免重复统计。

#### 清除 Badge

清除 Badge 数字的最好时机是打开 app 的时候。 设置当前 installation 的 badge 属性并保存到服务器:

```objc
- (void)applicationDidBecomeActive:(UIApplication *)application {
    int num=application.applicationIconBadgeNumber;
    if(num!=0){
        AVInstallation *currentInstallation = [AVInstallation currentInstallation];
        [currentInstallation setBadge:0];
        [currentInstallation saveEventually];
        application.applicationIconBadgeNumber=0;
    }
    [application cancelAllLocalNotifications];
    //...
}
```

清除 Badge 数字最相关的三个方法是`applicationDidBecomeActive:`, `application:didFinishLaunchingWithOptions:`和`application:didReceiveRemoteNotification:`。请阅读[ UIApplicationDelegate文档](http://developer.apple.com/library/ios/#DOCUMENTATION/UIKit/Reference/UIApplicationDelegate_Protocol/Reference/Reference.html)。

