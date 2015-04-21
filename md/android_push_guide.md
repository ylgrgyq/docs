# Android 消息推送开发指南

> 开始之前
> 在看下面的内容之前，我们假设您已经看过我们的[消息推送开发总览](./push_guide.html)，了解了基本的概念和模型。

Android 推送功能除了需要必须的 avoscloud.jar 以外，还需要额外的 avospush.jar。

Android 消息推送有专门的 Demo，请见[AVOSCloud-Push](https://github.com/leancloud/Android-SDK-demos/tree/master/AVOSCloud-Push)项目。

## Installation

当您的应用安装在用户设备后，如果要使用消息推送功能，LeanCloud SDK 会自动生成一个 Installation 对象。Installation 对象包含了推送所需要的所有信息。您可以使用 Android SDK，通过 Installation 对象进行消息推送。Installation 对象本质上代表了设备安装您的应用的一个安装信息。

### 保存 Installation

您可以通过以下代码保存您的 Installation id。如果您的系统之前还没有 Installation id, 系统会为您自动生成一个。如果您的应用卸载后，Installation id也将会被删除。


```java
AVInstallation.getCurrentInstallation().saveInBackground();
```

**这段代码应该在应用启动的时候调用一次，保证设备注册到 LeanCloud 平台，您可以监听调用回调，获取 installationId 做数据关联**

```
AVInstallation.getCurrentInstallation().saveInBackground(new SaveCallback() {
    public void done(AVException e) {
        if (e == null) {
            // 保存成功
            String installationId = AVInstallation.getCurrentInstallation().getInstallationId();
            // 关联  installationId 到用户表等操作……
        } else {
            // 保存失败，输出错误信息
        }
    }
});
```

## 订阅频道

你的应用可以订阅某个频道的消息，只要在保存 Installation 之前调用`PushService.subscribe`方法：

```java
// set a default callback. It's necessary for current SDK.
// 在v2.0以后的版本请务必添加这段代码，以避免推送无法成功达到客户端的问题
PushService.setDefaultPushCallback(this, PushDemo.class);
PushService.subscribe(this, "public", PushDemo.class);
PushService.subscribe(this, "private", Callback1.class);
PushService.subscribe(this, "protected", Callback2.class);
```

第一个参数是当前的 context，第二个参数是频道名称，第三个参数是回调对象的类，回调对象是指用户点击通知栏的通知进入的 Activity 页面。

退订频道也很简单：

```java
PushService.unsubscribe(context, "protected");
//退订之后需要重新保存 Installation
AVInstallation.getCurrentInstallation().saveInBackground();
```


## 推送消息

### 配置

请确保您的 AndroidManifest.xml 包含如下内容
```xml
<service android:name="com.avos.avoscloud.PushService"/>
```

同时设置了必要的权限

```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

为了让应用能在关闭的情况下也可以收到推送，你需要在`<application>`中加入：

```xml
<receiver android:name="com.avos.avoscloud.AVBroadcastReceiver">
    <intent-filter>
        <action android:name="android.intent.action.BOOT_COMPLETED" />
        <action android:name="android.intent.action.USER_PRESENT" />
    </intent-filter>
</receiver>
```

### 推送给所有的设备

```java
AVPush push = new AVPush();
JSONObject object = new JSONObject();
object.put("alert", "push message to android device directly");
push.setPushToAndroid(true);
push.setData(object);
push.sendInBackground(new SendCallback() {
    @Override
    public void done(AVException e) {
        if (e == null) {
            // push successfully.
        } else {
            // something wrong.
        }
    });
```

### 发送给特定的用户

* 发送给 public 频道的用户

```java
AVQuery pushQuery = AVInstallation.getQuery();
pushQuery.whereEqualTo("channels", "public");
AVPush push = new AVPush();
push.setQuery(pushQuery);
push.setMessage("Push to channel.");
push.setPushToAndroid(true);
push.sendInBackground(new SendCallback() {
    @Override
    public void done(AVException e) {
        if (e == null) {

        }   else {

        }
    }
});
```


* 发送给某个 Installation id的用户，通常来说，你会将 AVInstallation 关联到设备的登陆用户 AVUser 上作为一个属性，然后就可以通过下列代码查询 InstallationId 的方式来发送消息给特定用户，实现类似私信的功能：

```java
AVQuery pushQuery = AVInstallation.getQuery();
// 假设 THE_INSTALLATION_ID 是保存在用户表里的 installationId，
// 可以在应用启动的时候获取并保存到用户表
pushQuery.whereEqualTo("installationId", THE_INSTALLATION_ID);
AVPush.sendMessageInBackground("message to installation",  pushQuery, new SendCallback() {
    @Override
    public void done(AVException e) {

    }
});
```

在 2.6.7 以后，我们加入了通过 CQL 来筛选推送目标的功能，主要代码如下：

```java
    AVPush push = new AVPush();
    JSONObject data =
        new JSONObject(
            "{\"action\": \"com.avos.UPDATE_STATUS\", \"name\": \"Vaughn\", \"newsItem\": \"Man bites dog\"  }");
    push.setData(data);
    String installationId = AVInstallation.getCurrentInstallation().getInstallationId();
    push.setCloudQuery("select * from _Installation where installationId ='" + installationId
        + "'");
    push.sendInBackground(new SendCallback() {

      @Override
      public void done(AVException e) {

      }
    });
```
*注：CQL 与 AVQuery 同时只能设置一个，并且在设置 CQL 时，必须通过 CQL 来设置目标机器的类型(ios,android,wp)*

### 自定义 Receiver

如果您想推送消息，但不显示在 Andoid 系统的通知栏中，而是执行应用程序预定义的逻辑，你需要在你的 Android 项目中添加如下配置：

* AndroidManifest.xml 中声明您的 Receiver

```xml
<receiver android:name="com.avos.avoscloud.PushDemo.MyCustomReceiver">
    <intent-filter>
        <action android:name="android.intent.action.BOOT_COMPLETED" />
        <action android:name="android.intent.action.USER_PRESENT" />
        <action android:name="android.net.conn.CONNECTIVITY_CHANGE" />
        <action android:name="com.avos.UPDATE_STATUS" />
    </intent-filter>
</receiver>
```

其中 com.avos.avoscloud.PushDemo.MyCustomReceiver 是您的 Android 的 Receiver 类。

而 `<action android:name="com.avos.UPDATE_STATUS" />` 需要与 push 的 data 中指定的 action 相对应。

* 你的 Receiver 可以按照如下方式实现

```java
public class MyCustomReceiver extends BroadcastReceiver {
    private static final String TAG = "MyCustomReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        LogUtil.log.d(TAG, "Get Broadcat");
        try {
            String action = intent.getAction();
            String channel = intent.getExtras().getString("com.avos.avoscloud.Channel");
            //获取消息内容
            JSONObject json = new JSONObject(intent.getExtras().getString("com.avos.avoscloud.Data"));

            Log.d(TAG, "got action " + action + " on channel " + channel + " with:");
            Iterator itr = json.keys();
            while (itr.hasNext()) {
                String key = (String) itr.next();
                Log.d(TAG, "..." + key + " => " + json.getString(key));
            }
        } catch (JSONException e) {
            Log.d(TAG, "JSONException: " + e.getMessage());
        }
    }
}
```

* 同时，要求发送推送的请求也做相应更改，例如

```sh
curl -X POST \
  -H "X-AVOSCloud-Application-Id: {{appid}}"          \
  -H "X-AVOSCloud-Application-Key: {{appkey}}"        \
  -H "Content-Type: application/json" \
  -d '{
        "channels":[ "public"],
        "data": {
          "action": "com.avos.UPDATE_STATUS",
          "name": "LeanCloud."
        }
      }' \
  https://leancloud.cn/1.1/push
```

请注意：**如果您使用自定义的 Receiver，发送的消息必须带 action，并且其值在自定义的 Receiver 配置的 <intent-filter> 列表里存在，比如这里的'com.avos.UPDATE_STATUS'，请使用自己的 action，尽量不要跟其他应用混淆，推荐采用域名来定义**


### 跟踪 Android 推送和应用的打开情况

您可以在订阅频道对应的 Activity 中添加跟踪应用打开情况的统计代码，您的 Activity 可以按照如下方式实现 `onStart` 方法：

```java
public class MyActivity extends Activity {
	@Override
	protected void onStart() {
		super.onStart();

		Intent intent = getIntent();
		AVAnalytics.trackAppOpened(intent);
	}
}
```

您可以在 [请求分析](/apistat.html?appid={{appid}}#/_appOpenWithPush) 菜单里看到通知和应用的打开情况。


### Installation自动过期和清理

每当用户打开应用，我们都会更新该设备的 Installation 的 updatedAt 时间戳。当用户长期没有更新 Installation 的 updatedAt 时间戳，换句话说，就是用户长期没有打开应用（默认是超过 60 天没有打开），这个 Installation 的 valid 将被设置为 false，往这个 Installation 发送的消息将被忽略，直到用户以后某天打开应用更新了 updatedAt，valid 将再次设置为 true。

如果超过 120 天，用户仍然没有打开过应用，那么该 Installation 将被删除。不过您不需要担心，当用户再次打开应用的时候，仍然会自动创建一个新的 Installation 用于推送。
