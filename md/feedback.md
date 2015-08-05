# 用户反馈组件开发指南

AVOSCloud Feedback 是一个非常轻量的模块，可以用最少两行的代码来实现一个用户反馈系统，并且能够方便的在我们的移动 App 中查看用户的反馈。

**你可以在应用的组件菜单里看到所有的用户反馈并回复。**

## LeanCloud 移动 App

用户如果有新的反馈会主动推送通知到我们提供的移动App，建议你安装，并使用LeanCloud帐户登录：

* [Android App](http://download.leancloud.cn/apk/AVOSCloudMobileApp.apk)
* [iOS App](https://itunes.apple.com/cn/app/avos-cloud-ying-yong-tong/id854896336?mt=8&uo=4)

## iOS 反馈组件

### 开源项目地址

目前反馈组件从 SDK 中独立出来，开放了源码。项目地址是：[leancloud-feedback-ios](https://github.com/leancloud/leancloud-feedback-ios)。从 v3.1.3 开始，SDK 中的 feedback 组件不再维护。欢迎大家使用开源组件，相信在大家的共同维护下，开源组件会变得越来越好。

### 使用默认用户反馈界面
开发者可以使用当前的 UIViewController 打开 AVOSCloud 提供的默认反馈界面，代码如下：

```objc
AVUserFeedbackAgent *agent = [AVUserFeedbackAgent sharedInstance];

/* title 传 nil 表示将第一条消息作为反馈的标题 */
[agent showConversations:self title:nil contact:@"test@leancloud.rocks"];
```
![image](images/avoscloud-ios-feedback.png)

特别指出，如果要使用默认的用户反馈界面而且手动安装了 AVOSCloud.framework，开发者需要将 **AVOSCloud.framwork** > **Resources** > **AVOSCloud.bundle** 手动拖入工程项目中。

### 自定义用户反馈界面
你也可以自定义反馈界面，`LCUserFeedbackThread` 和 `LCUserFeedbackReply` 这两个类提供了相应 API 来完成你想要的功能。

```objc
@interface LCUserFeedbackThread : NSObject

/*!
 * 获取反馈，使用 contact 查询。
 * @param contact 联系方式。
 * @param block 结果回调。
 */
+ (void)fetchFeedbackWithContact:(NSString*)contact withBlock:(AVIdResultBlock)block;

/*!
 * 创建反馈，并使用 content 作为标题。
 * @param content 反馈的标题，通常，你可以将反馈的第一条消息作为标题。
 * @param contact 联系方式。
 * @param block 结果回调。
 */
+ (void)feedbackWithContent:(NSString *)content contact:(NSString *)contact withBlock:(AVIdResultBlock)block;

/*!
 * 获取所有反馈中的所有消息。
 * @param block 结果回调。
 */
- (void)fetchFeedbackRepliesInBackgroundWithBlock:(AVArrayResultBlock)block;

/*!
 * 发送一条消息。
 * @param feedbackReply 反馈消息。
 * @param block 结果回调。
 */
- (void)saveFeedbackReplyInBackground:(LCUserFeedbackReply *)feedbackReply withBlock:(AVIdResultBlock)block;

@end

@interface LCUserFeedbackReply : NSObject

/*!
 * 创建一条反馈消息。
 * @param content 消息内容。
 * @param type 回复的类型，比如你可以标记 @"dev" 或者 @"user"。
 */
+ (instancetype)feedbackReplyWithContent:(NSString *)content type:(NSString *)type;

@end
```

利用上述 API，可以实现一个完整的反馈功能。例如，你可以首先调用 API：

```objc
+ (void)fetchFeedbackWithContact:(NSString*)contact withBlock:(AVIdResultBlock)block;
```

通过 `contact` 来查询之前已经创建过的反馈，如果查询不到，说明没有通过 `contact` 创建过，利用以下 API：

```objc
+ (void)feedbackWithContent:(NSString *)content contact:(NSString *)contact withBlock:(AVIdResultBlock)block;
```

来创建一个反馈，`content` 将作为反馈的标题。我们推荐使用第一条消息作为反馈的标题。

若查询到 `contact` 对应的反馈，则可以立即同步反馈中的消息：

```objc
- (void)fetchFeedbackRepliesInBackgroundWithBlock:(AVArrayResultBlock)block;
```

最后，若想发送一条反馈消息，可以结合以下两个 API 来实现：

```objc
+ (instancetype)feedbackReplyWithContent:(NSString *)content type:(NSString *)type;
- (void)saveFeedbackReplyInBackground:(LCUserFeedbackReply *)feedbackReply withBlock:(AVIdResultBlock)block;
```

你也可以参考 `LCUserFeedbackViewController` 类中处理反馈的逻辑。

### AVUserFeedbackThread 数据模型

`AVUserFeedbackThread` 包含的属性有：

属性|说明
---|---
content | 代表反馈内容
createdAt | 反馈内容创建时间
type | 反馈类型，分别为 user 和 dev。

## Android Feedback 组件

### 导入 SDK

你可以从我们的 [SDK 下载](sdk_down.html) 页面获取 **用户反馈模块**。解压缩后，将 libs 下得的 avosfeedback-v{**version**}.jar 包（需要包括下载的其他基础 jar 包）加入你工程的 libs 下面。

之后，你需要将 res 下的资源文件夹拷贝并且合并到你工程的 res 目录下。更改资源文件的内容并不影响 SDK，但是请不要改变资源的文件名和文件内资源ID。

注：LeanCloud Feedback Android SDK 的资源文件都是以 avoscloud_feedback 打头。


### 添加代码，使用基础功能

#### 配置 AndroidManifest.xml

打开 AndroidManifest.xml文件，在里面添加需要用到的 activity 和需要的权限:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
    <application...>
       <activity
         android:name="com.avos.avoscloud.feedback.ThreadActivity" >
       </activity>
    </application>
```

**由于一些 UI 的原因，Feedback SDK 的最低 API level 要求是 12，如你需要更低的版本支持，请参照文档中的高级定制部分进行开发。**

**如果依然遇到 Actionbar 相关的 NPE 问题，请检查 Application Theme，确保 ThreadActivity 中的 Actionbar。**

>注：在 2.5.7 以后，用户反馈中添加了图片上传功能，所以在 Permission 中需要添加 WRITE_EXTERNAL_STORAGE 权限，如果你在使用过程中遇到文件类似情况，请先检查权限设置是否有相应的更新。


#### 添加代码实现基础的反馈功能

1.在代码中启用用户反馈模块

```java
FeedbackAgent agent = new FeedbackAgent(context);
agent.startDefaultThreadActivity();
```
![image](images/avoscloud-feedback.png)


2.新回复通知

如果你需要在用户打开 App 时，通知用户新的反馈回复，只需要在你的入口 Activity 的 `OnCreate` 方法中添加:

```java
agent.sync();
```

>注意：此功能使用了 Android Support Library, 所以请添加最新版本 android-support-v4.jar 到工程的libs目录下。

当用户收到开发者的新回复时，就会产生一个新的消息通知。如果你需要改变通知的图标，请替换 res 下的 **avoscloud_feedback_notification.png** 文件即可。

如果你不需要通知栏通知，又迫切需要在用户在打开 App 时同步反馈信息，你可以调用

```java
agent.getDefaultThread().sync(SyncCallback);
```

这里的 SyncCallback 是一个异步回调，其中的方法会在同步请求成功以后被调用。


### 高级定制指南

如果我们的反馈组件 UI 无法满足你的需求，你可以通过 Feedback SDK 提供的数据模型结合自定义 UI 来满足你的需求。


#### Feedback 数据模型

* **Comment**    
  代表了反馈系统中间，用户或者开发者的每一次回复。不同的类型可以通过 CommentType 属性来指定：

```java
Comment userComment = new Comment("这是一个用户反馈");//不指定CommentType类型，即为CommentType.USER
Comment anotherUserComment = new Comment("再来说一句",CommentType.USER);
Comment devComment = new Comment("开发者回复",CommentType.DEV);
```

* **FeedbackThread**  
  代表了用户与开发者的整个交流过程。其中有两个个属性可供设置：`contact` 和 `commentList`：

```java
FeedbackThread thread = agent.getDefaultThread();
thread.setContact("你的邮箱或者QQ账号");
thread.add(newComment);
//或者也可以使用thread.getCommentsList().add(newComment);
thread.sync(syncCallback);
```

更多的信息你可以参考我们的实现的 Activity：<https://github.com/leancloud/avoscloud-sdk/blob/master/android/avoscloudfeedback/src/com/avos/avoscloud/feedback/ThreadActivity.java>

>注：ThreadActivity 使用了 ActionBar(API 11)、EditText 的 textCursorDrawable 属性 (API 12)。

