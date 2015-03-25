# Android 实时通信服务(v2)

## 简介

在阅读本开发指南之前，请先阅读下[《实时通信开发指南(v2)》](./realtime_v2.html)，了解实时通信的基本概念和模型。

一对一的文本聊天
------

我们先从最简单的环节入手，看看怎么用 LeanCloud IM SDK v2 实现一对一文本聊天。

###初始化

和 LeanCloud 其他服务一样，实时聊天服务的初始化也是在 Application 的 `onCreate` 方法中进行的：

```
public class MyApplication extends Application{

    public void onCreate(){
      ...
      AVOSCloud.initialize(this,"{{appId}}","{{appKey}}");
      ...
    }
}
```

并且在AndroidManifest.xml中间声明：

```
<manifest>
   ...

   <application
        android:name=".MyApplication"
        ....>
        ...

        <service android:name="com.avos.avoscloud.PushService" />

        <receiver android:name="com.avos.avoscloud.AVBroadcastReceiver">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <action android:name="android.intent.action.USER_PRESENT" />
            </intent-filter>
        </receiver>
        ...
   </application>

</manifest>
```

接下来我们需要完成用户登录。

###登录

假定聊天发起方名叫 Tom，为直观起见，我们使用用户名来作为 `clientId` 登录聊天系统（LeanCloud 云端只要求 `clientId` 在应用内唯一即可，具体用什么数据由应用层决定），代码如下：

```
AVIMClient imClient = AVIMClient.getInstance("Tom");
imClient.open(new IMClientCallback(){
  @Override
  public void done(AVIMClient client, AVException e) {
    if (null != e) {
      // 出错了，可能是网络问题无法连接 LeanCloud 云端，请检查网络之后重试。
      // 此时聊天服务不可用。
      e.printStackTrace();
    } else {
      // 成功登录，可以开始进行聊天了（假设为 MainActivity）。
      Intent intent = new Intent(currentActivity, MainActivity.class);
      currentActivity.startActivity(intent);
    };
  }
});
```

### 建立对话

假定我们要跟「Bob」这个用户进行聊天，我们先创建一个对话，代码如下：

```
List<String> clientIds = new ArrayList<String>();
clientIds.add("Tom");
clientIds.add("Bob");

// 我们给对话增加一个自定义属性 type，表示单聊还是群聊
// 常量定义：
// int ConversationType_OneOne = 0; // 两个人之间的单聊
// int ConversationType_Group = 1;  // 多人之间的群聊
Map<String, Object> attr = new HashMap<String, Object>();
attr.put("type", ConversationType_OneOne);

imClient.createConversation(clientIds, attr, new AVIMConversationCreatedCallback() {
  @Override
  public void done(AVIMConversation conversation, AVException e) {
    if (null != conversation) {
      // 成功了，这时候可以显示对话的 Activity 页面（假定为 ChatActivity）了。
      Intent intent = new Intent(this, ChatActivity.class);
      Intent.putExtra(“conversation”, conversation);
      startActivity(intent);
    }
  }
});
```

> 建立的「对话」在控制台怎么查看
> 
> 如你所见，我们创建一个对话的时候，指定了成员（Tom 和 Bob）和一个额外的属性（{type: 0}）。这些数据保存到云端后，你在 **控制台** -> **存储** -> **数据** 里面会看到，_Conversation 表中增加了一条记录，新记录的 `m` 属性值为`["Tom", "Bob"]`，`attr` 属性值为`{"type":0}`。如你所料，`m` 属性就是对应着成员列表，`attr` 属性就是用户增加的额外属性值（以对象的形式存储）。

###发送消息

建立好对话之后，要发送消息是很简单的：

```
AVIMMessage message = new AVIMMessage();
message.setContent("hello");
conversation.sendMessage(message, new AVIMConversationCallback() {
  @Override
  public void done(AVException e) {
    if (null != e) {
      // 出错了。。。
      e.printStackTrace();
    } else {
      Logger.d("发送成功，msgId=" + message.getMessageId());
    }
  }
});
```

好了，这样一条消息就发送过去了。但是问题来了，对于「Bob」而言，他怎么才能收到别人发给他的消息呢？

### 消息接收

在 Bob 这一端，要能接收到消息，需要如下几步：

1，进行初始化；

2，实现自己的 `AVIMMessageHandler`，响应新消息到达通知，主要是如下函数：

`public void onMessage(AVIMMessage message, AVIMConversation conversation, AVIMClient client);`

对于 Tom 发过来的消息，要显示出来，我们只需实现 `onMessage` 即可，示例代码如下：

```
class CustomMessageHandler extends AVIMMessageHandler {
  @Override
  public void onMessage(AVIMMessage message, AVIMConversation conversation, AVIMClient client) {
    // 新消息到来了。在这里增加你自己的处理代码。
    String msgContent = message.getContent();
    Logger.d(conversation.getConversationid() + " 收到一条新消息：" + msgContent);
  }
}
```

3，进行登录，代码也与发送端一样。

完整代码如下：

```
// 自定义消息响应类
class CustomMessageHandler extends AVIMMessageHandler {
  @Override
  public void onMessage(AVIMMessage message, AVIMConversation conversation, AVIMClient client) {
    // 新消息到来了。在这里增加你自己的处理代码。
    String msgContent = message.getContent();
    Logger.d(conversation.getConversationid() + " 收到一条新消息：" + msgContent);
  }
}

// application 的初始化部分
public void onCreate(){
  ...
  AVOSCloud.initialize(this,"{{appId}}","{{appKey}}");
  AVIMMessageManager.registerDefaultMessageHandler(new CustomMessageHandler());
  ...
}

// 用户登录部分
AVIMClient imClient = AVIMClient.getInstance("Bob");
imClient.open(new IMClientCallback(){
  @Override
  public void done(AVIMClient client, AVException e) {
    if (null != e) {
      // 出错了，可能是网络问题无法连接 LeanCloud 云端，请检查网络之后重试。
      // 此时聊天服务不可用。
      e.printStackTrace();
    } else {
      // 成功登录，可以开始进行聊天了。
    };
  }
});

```

> 注意！
> `AVIMMessageManager.registerDefaultMessageHandler()` 一定要在 `AVIMClient.open()` 之前调用，否则可能导致服务器发回来的部分消息丢失。


几个主要的回调接口
------
从上面的例子中可以看到，要接收到别人给你发送的消息，需要重载 AVIMMessageHandler 类。从 v2 版开始，LeanCloud IM SDK 大量采用回调来反馈操作结果，但是对于一些被动的消息通知，则还是采用接口来实现的，包括：

* 当前网络出现变化
* 对话中有新的消息
* 对话中有新成员加入
* 对话中有成员离开
* 被邀请加入某对话
* 被踢出对话

LeanCloud IM SDK 内部使用了三种接口来响应这些事件。

### 网络事件响应接口
主要用来处理网络变化事件，接口定义在 `AVIMClientEventHandler`，主要函数为：

* `void onConnectionPaused(AVIMClient client)` 指网络连接断开事件发生，此时聊天服务不可用。
* `void onConnectionResume(AVIMClient client)` 指网络连接恢复正常，此时聊天服务变得可用。

在网络中断的情况下，所有的消息收发和对话操作都会出现问题。

通过 `AVIMClient.setClientEventHandler(AVIMClientEventHandler handler)` 可以设定全局的 ClientEventHandler。

### 对话成员变化响应接口
主要用来处理对话中成员变化的事件，接口定义在 `AVIMConversationEventHandler`,主要函数为：

* `onMemberLeft(AVIMClient client, AVIMConversation conversation, List<String> members, String kickedBy)` 对话中有成员离开时所有剩余成员都会收到这一通知。参数意义说明如下：
  - conversation 指目标对话；
  - members 指离开的成员列表；
  - kickedBy 表示踢人者的 id；
* `onMemberJoined(AVIMClient client, AVIMConversation conversation, List<String> members, String invitedBy)` 对话中有新成员加入时所有成员都会收到这一通知。参数意义说明如下：
  - conversation 指目标对话；
  - members 指加入的新成员列表；
  - invitedBy 表示邀请者的 id
* `onKicked(AVIMClient client, AVIMConversation conversation, String kickedBy)` 当前用户被踢出对话的通知，参数意义说明如下：
  - conversation 指目标对话；
  - kickedBy 表示踢人者的 id
* `onInvited(AVIMClient client, AVIMConversation conversation, String operator)` 当前用户被邀请加入对话的通知。参数意义说明如下：
  - conversation 指目标对话；
  - operator 表示邀请者的 id

通过 `AVIMMessageManager.setConversationEventHandler(AVIMConversationEventHandler handler)` 可以设置全局的 ConversationEventHandler。

### 消息响应接口
主要用来处理新消息到达事件，接口定义在 `MessageHandler`，`AVIMMessageHandler` 是一个空的实现类，我们应该通过重载 AVIMMessageHandler 的相关方法来完成消息处理。主要的方法有：

* `onMessage(AVIMMessage message, AVIMConversation conversation)` 指接收到新的消息。参数意义说明如下：
  - conversation 指目标对话；
  - message 表示消息实例
* `onMessageReceipt(AVIMMessage message, AVIMConversation conversation, AVIMClient client)` 自己发送的消息被对方接收时会收到此通知，各参数意义同上。

通过 `AVIMMessageManager.registerDefaultMessageHandler(handler)` 可以设置全局的 MessageHandler。

我们实现这三类接口，就可以处理所有的通知消息了。示例代码如下：

```
// 处理网络状态变化事件
class CustomNetworkHandler extends AVIMClientEventHandler {
  @Override
  public void onConnectionPaused(AVIMClient client) {
    // 请按自己需求改写
    Logger.d("connect paused");
  }

  @Override
  public void onConnectionResume(AVIMClient client) {
    // 请按自己需求改写
    Logger.d("connect resume");
  }
}

// 处理对话成员变化事件
class CustomConversationHandler extends AVIMConversationEventHandler {
  public private Context gContext = null;
  private void toast(String str) {
    Toast.makeText(gContext, str, Toast.LENGTH_SHORT).show();
  }
  private void toast(Context context, String str) {
    Toast.makeText(context, str, Toast.LENGTH_SHORT).show();
  }

  @Override
  public void onMemberLeft(AVIMClient client, AVIMConversation conversation, List<String> members, String kickedBy) {
    // 请按自己需求改写
    toast(MsgUtils.nameByUserIds(members) + " left, kicked by " + MsgUtils.nameByUserId(kickedBy));
    //注：MsgUtils 是一个辅助类，nameByUserIds 用来将 userId 转换成用户名
  }

  @Override
  public void onMemberJoined(AVIMClient client, AVIMConversation conversation, List<String> members, String invitedBy) {
    // 请按自己需求改写
    toast(MsgUtils.nameByUserIds(members) + " joined , invited by " + MsgUtils.nameByUserId(invitedBy));
    //注：MsgUtils 是一个辅助类，nameByUserIds 用来将 userId 转换成用户名
  }

  @Override
  public void onKicked(AVIMClient client, AVIMConversation conversation, String kickedBy) {
    // 请按自己需求改写
    toast("you are kicked by " + MsgUtils.nameByUserId(kickedBy));
  }

  @Override
  public void onInvited(AVIMClient client, AVIMConversation conversation, String operator) {
    // 请按自己需求改写
    toast("you are invited by " + MsgUtils.nameByUserId(operator));
  }
};

// 处理新消息到达事件
class CustomMsgHandler extends AVIMMessageHandler {
  @Override
  public void onMessage(AVIMMessage message, AVIMConversation conversation, AVIMClient client) {
    // 请按自己需求改写
    String msgContent = message.getContent();
    Logger.d(conversation.getConversationid() + " 收到一条新消息：" + msgContent);
  }

  @Override
  public void onMessageReceipt(AVIMMessage message, AVIMConversation conversation, AVIMClient client) {
    // 请按自己需求改写
    Logger.d("发往对话 " + conversation.getConversationid() + " 的消息 "+ message.getMessageId() +" 已被接收");
  }
}

// 设置事件响应接口
AVIMClient.setClientEventHandler(new CustomNetworkHandler());
AVIMMessageManager.setConversationEventHandler(new CustomConversationHandler());
AVIMMessageManager.registerDefaultMessageHandler(new CustomMsgHandler());
```


支持富媒体的聊天消息
-------------

上面的代码演示了如何发送简单文本信息，但是现在的交互方式已经越来越多样化，图像、语音、视频已是非常普遍的消息类型。v2 版的 LeanCloud IM SDK 已经可以很好地支持这些富媒体消息，具体说明如下：


### 基类：AVIMTypedMessage

所有富媒体消息的基类，其声明为

```
//SDK定义的消息类型，LeanCloud SDK 自身使用的类型是负数，所有正数留给开发者自定义扩展类型使用，0 作为「没有类型」被保留起来。
enum AVIMReservedMessageType {
  UnsupportedMessageType(0),
  TextMessageType(-1),
  ImageMessageType(-2),
  AudioMessageType(-3),
  VideoMessageType(-4),
  LocationMessageType(-5),
  FileMessageType(-6);
};

public abstract class AVIMTypedMessage extends AVIMMessage {
  public AVIMTypedMessage();

  public int getMessageType();

  @Override
  public final String getContent();

  @Override
  public final void setContent(String content);
}
```

### 文本消息（AVIMTextMessage）

AVIMTypedMessage 子类，表示一般的文本消息，其声明为

```
public class AVIMTextMessage extends AVIMTypedMessage {
  public String getText();
  public void setText(String text);

  public Map<String, Object> getAttrs();
  public void setAttrs(Map<String, Object> attr);
}
```

可以看到，对于文本消息，主要的属性有 `text` 和 `attr` 两个，通过简单的 getter/setter 就可以访问到。要发送文本消息，示例代码为：

```
AVIMTextMessage message = new AVIMTextMessage();
message.setText("hello");
conversation.sendMessage(message, new AVIMConversationCallback() {
  @Override
  public void done(AVException e) {
    if (null != e) {
      // 出错了。。。
      e.printStackTrace();
    } else {
      Logger.d("message sent.");
    }
  }
});
```

### 文件消息（AVIMFileMessage）
AVIMTypedMessage 子类，用来发送带附件的消息，开发者可以用它来发送「离线文件」。对于此类消息，LeanCloud IM SDK 内部会先把文件上传到 LeanCloud 文件存储服务器（自带 CDN 功能），然后把文件元数据（url，文件大小等等）放在消息包内发送到 LeanCloud 实时通信服务端。其构造函数声明为：

```
// 传入本地文件路径，构造消息对象
public AVIMFileessage(String localPath) throws FileNotFoundException, IOException;
// 传入本地文件，构造消息对象
public AVIMFileMessage(File localFile) throws FileNotFoundException, IOException;
// 传入 AVFile 实例，构造消息对象
public AVIMFileMessage(AVFile file);
```

与文本消息类似，文件消息也支持附带文本和其他自定义属性，可以通过如下方法添加 / 获取更多信息：

* String getText() / void setText(String text)
* Map<String, Object> getAttrs() / void setAttrs(Map<String, Object> attr);

发送文件消息的示例代码为：

```
String localZipfilePath;
try {
  AVIMFileMessage message = new AVIMFileMessage(localZipfilePath);
  message.setText("这是你要的文档");
  conversation.sendMessage(message, new AVIMConversationCallback() {
    @Override
    public void done(AVException e) {
      if (null != e) {
        // 出错了。。。
        e.printStackTrace();
      } else {
        Logger.d("message sent");
      }
    }
  });
} catch (Exception ex) {
}
```

接收到这样消息之后，开发者可以通过以下方法，获取到文件元数据（size 等）和一个包含二进制数据的 AVFile 对象：

* `AVFile getAVFile()` 方法会返回一个二进制文件的 AVFile 实例，之后可以通过 AVFile 来完成数据下载或者其他操作，具体可以参见 [AVFile 说明](./android_guide.html#文件)
* `String getFileUrl()` 方法会返回二进制文件的 url
* `long getSize()` 方法会返回二进制文件的实际大小（单位：byte）
* `Map<String, Object> getFileMetaData()` 可以获取二进制文件的其他元数据信息。


### 图像消息（AVIMImageMessage）
AVIMFileMessage 子类，专门用来发送图像和附带文本的混合消息，其构造函数声明为：

```
// 传入本地文件路径，构造消息对象
public AVIMImageMessage(String localPath) throws FileNotFoundException, IOException;
// 传入本地文件，构造消息对象
public AVIMImageMessage(File localFile) throws FileNotFoundException, IOException;
// 传入 AVFile 实例，构造消息对象
public AVIMImageMessage(AVFile file);
```

发送图像消息的示例代码为：

```
String localImagePath;
try {
  AVIMImageMessage message = new AVIMImageMessage(localImagePath);
  message.setText("你说我好看不？");
  conversation.sendMessage(message, new AVIMConversationCallback() {
    @Override
    public void done(AVException e) {
      if (null != e) {
        // 出错了。。。
        e.printStackTrace();
      } else {
        Logger.d("message sent");
      }
    }
  });
} catch (Exception ex) {
}
```

接收到这样消息之后，开发者可以通过如下方法，获取到若干图像元数据（width，height，图像 size）和一个包含图像数据的 AVFile 对象：

* `int getWidth()` 方法会返回图像的宽度（单位：pixel）
* `int getHeight()` 方法会返回图像的高度（单位：pixel）
* `AVFile getAVFile()` （继承自 AVIMFileMessage）方法会返回一个图像文件的 AVFile 实例
* `String getFileUrl()` （继承自 AVIMFileMessage）方法会返回图像文件的 url
* `long getSize()` （继承自 AVIMFileMessage）方法会返回图像文件的实际大小（单位：byte）
* `String getText()` （继承自 AVIMFileMessage）方法会返回随图像一起发送的文本信息。
* `Map<String, Object> getFileMetaData()` （继承自 AVIMFileMessage）可以获取图像的其他元数据信息。


### 音频消息（AVIMAudioMessage）
AVIMFileMessage 子类，专门用来发送语音和附带文本的混合消息，其构造函数声明为：

```
// 传入本地文件路径，构造消息对象
public AVIMAudioMessage(String localPath) throws FileNotFoundException, IOException;
// 传入本地文件，构造消息对象
public AVIMAudioMessage(File localFile) throws FileNotFoundException, IOException;   
// 传入 AVFile 实例，构造消息对象
public AVIMAudioMessage(AVFile file);
```

发送音频消息的示例代码为：

```
String localAudioPath;
try {
  AVIMAudioMessage message = new AVIMAudioMessage(localAudioPath);
  message.setText("听听我唱的小苹果：）");
  conversation.sendMessage(message, new AVIMConversationCallback() {
    @Override
    public void done(AVException e) {
      if (null != e) {
        // 出错了。。。
        e.printStackTrace();
      } else {
        Logger.d("message sent");
      }
    }
  });
} catch (Exception ex) {
}
```

接收到这样消息之后，开发者可以通过如下方法，获取到若干音频元数据（时长 duration、音频 size）和一个包含音频数据的 AVFile 对象：

* `double getDuration()` 方法会返回音频的长度（单位：秒）
* `AVFile getAVFile()` （继承自 AVIMFileMessage）方法会返回一个音频文件的 AVFile 实例
* `String getFileUrl()` （继承自 AVIMFileMessage）方法会返回音频文件的 url
* `long getSize()` （继承自 AVIMFileMessage）方法会返回音频文件的实际大小（单位：byte）
* `String getText()` （继承自 AVIMFileMessage）方法会返回随音频一起发送的文本信息。
* `Map<String, Object> getFileMetaData()` （继承自 AVIMFileMessage）可以获取音频的其他元数据信息。


### 视频消息（AVIMVideoMessage）
AVIMFileMessage 子类，专门用来发送视频和附带文本的混合消息，其构造函数声明为：

```
// 传入本地文件路径，构造消息对象
public AVIMVideoMessage(String localPath) throws FileNotFoundException, IOException;
// 传入本地文件，构造消息对象
public AVIMVideoMessage(File localFile) throws FileNotFoundException, IOException;
// 传入 AVFile 文件，构造消息对象
public AVIMVideoMessage(AVFile file);
```

发送视频消息的示例代码为：

```
String localVideoPath;
try {
  AVIMVideoMessage message = new AVIMVideoMessage(localVideoPath);
  message.setText("敢不敢跟我比一比");
  conversation.sendMessage(message, new AVIMConversationCallback() {
    @Override
    public void done(AVException e) {
      if (null != e) {
        // 出错了。。。
        e.printStackTrace();
      } else {
        Logger.d("message sent");
      }
    }
  });
} catch (Exception ex) {
}
```

接收到这样消息之后，开发者可以可以通过如下方法，获取到若干视频元数据（时长 duration、视频 size）和一个包含视频数据的 AVFile 对象:

* `double getDuration()` 方法会返回视频的长度（单位：秒）
* `AVFile getAVFile()` （继承自 AVIMFileMessage）方法会返回一个视频文件的 AVFile 实例
* `String getFileUrl()` （继承自 AVIMFileMessage）方法会返回视频文件的 url
* `long getSize()` （继承自 AVIMFileMessage）方法会返回视频文件的实际大小（单位：byte）
* `String getText()` （继承自 AVIMFileMessage）方法会返回随视频一起发送的文本信息。
* `Map<String, Object> getFileMetaData()` （继承自 AVIMFileMessage）可以获取视频的其他元数据信息。

### 地理位置消息（AVIMLocationMessage）
AVIMTypedMessage 子类，支持发送地理位置信息和附带文本的混合消息，其声明为：

```
public class AVIMLocationMessage extends AVIMTypedMessage {
  public String getText();
  public void setText(String text);

  public Map<String, Object> getAttrs();
  public void setAttrs(Map<String, Object> attr);
  
  public AVGeoPoint getLocation();
  public void setLocation(AVGeoPoint location);
}
```

与文本消息类似，地理位置消息只是增加了一个 AVGeoPoint 的 Location 属性。要发送位置消息的示例代码为：
```
AVIMLocationMessage message = new AVIMLocationMessage();
message.setText("快点过来！");
message.setLocation(new AVGeoPoint(15.9, 56.4));
conversation.sendMessage(message, new AVIMConversationCallback() {
  @Override
  public void done(AVException e) {
    if (null != e) {
      // 出错了。。。
      e.printStackTrace();
    } else {
      Logger.d("message sent");
    }
  }
});
```

接收到这样的消息之后，开发者可以获取到具体的地理位置数据。

### 如何接收富媒体消息

新版 LeanCloud IM SDK 内部封装了对富媒体消息的支持，所有富媒体消息都是从 AVIMTypedMessage 派生出来的。发送的时候可以直接调用 `conversation.sendMessage()` 函数。在接收端，我们也专门增加了一类回调接口 AVIMTypedMessageHandler，其定义为：

```
public class AVIMTypedMessageHandler<T extends AVIMTypedMessage> extends MessageHandler<T> {

  @Override
  public void onMessage(T message, AVIMConversation conversation, AVIMClient client);

  @Override
  public void onMessageReceipt(T message, AVIMConversation conversation, AVIMClient client);
}
```

开发者可以编写自己的消息处理 handler，然后调用 `AVIMMessageManager.registerMessageHandler(Class<? extends AVIMMessage> clazz,
      MessageHandler<?> handler)` 函数来注册目标 handler。

接收端对于富媒体消息的通知处理的示例代码如下：

```
class MsgHandler extends AVIMTypedMessageHandler<AVIMTypedMessage> {

  @Override
  public void onMessage(AVIMTypedMessage message, AVIMConversation conversation, AVIMClient client) {
    // 请按自己需求改写
    switch(message.getMessageType()) {
    case AVIMReservedMessageType.TextMessageType:
      AVIMTextMessage textMsg = (AVIMTextMessage)message;
      Logger.d("收到文本消息:" + textMsg.getText() + ", msgId:" + textMsg.getMessageId());
      break;

    case AVIMReservedMessageType.FileMessageType:
      AVIMFileMessage fileMsg = (AVIMFileMessage)message;
      Logger.id("收到文件消息。msgId=" + fileMsg.getMessageId() + ", url=" + fileMsg.getFileUrl() + ", size=" + fileMsg.getSize());
      break;

    case AVIMReservedMessageType.ImageMessageType:
      AVIMImageMessage imageMsg = (AVIMImageMessage)message;
      Logger.id("收到图片消息。msgId=" + imageMsg.getMessageId() + ", url=" + imageMsg.getFileUrl() + ", width=" + imageMsg.getWidth() + ", height=" + imageMsg.getHeight());
      break;

    case AVIMReservedMessageType.AudioMessageType:
      AVIMAudioMessage audioMsg = (AVIMAudioMessage)message;
      Logger.id("收到音频消息。msgId=" + audioMsg.getMessageId() + ", url=" + audioMsg.getFileUrl() + ", duration=" + audioMsg.getDuration());
      break;

    case AVIMReservedMessageType.VideoMessageType:
      AVIMVideoMessage videoMsg = (AVIMAudioMessage)message;
      Logger.id("收到视频消息。msgId=" + videoMsg.getMessageId() + ", url=" + videoMsg.getFileUrl() + ", duration=" + videoMsg.getDuration());
      break;

    case AVIMReservedMessageType.LocationMessageType:
      AVIMLocationMessage locMsg = (AVIMLocationMessage)message;
      Logger.id("收到位置消息。msgId=" + locMsg.getMessageId() + ", latitude=" + locMsg.getLocation().getLatitude() + ", longitude=" + locMsg.getLocation().getLongitude());
      break;
    }
  }

  @Override
  public void onMessageReceipt(AVIMTypedMessage message, AVIMConversation conversation, AVIMClient client) {
    // 请加入你自己需要的逻辑...
  }
}
MsgHandler msgHandler = new MsgHandler();
AVIMMessageManager.registerMessageHandler(AVIMTypedMessage.class, msgHandler);
```

LeanCloud IM SDK 内部消息分发的逻辑是这样的：对于收到的任一新消息，SDK 内部都会先解析消息的类型，根据类型找到开发者为这一类型注册的处理 handler，然后逐一调用这些 handler 的 onMessage 函数。如果没有找到专门处理这一类型消息的 handler，就会转交给 defaultHandler 处理。

这样一来，在开发者为 TypedMessage（及其子类） 指定了专门的 handler，也指定了全局的 defaultHandler 了的时候，如果发送端发送的是通用的 AVIMMessage 消息，那么接受端就是 **AVIMMessageManager.registerDefaultMessageHandler()中指定的 handler** 被调用；如果发送的是 AVIMTypedMessage（及其子类）的消息，那么接受端就是 **AVIMMessageManager.registerMessageHandler()中指定的 handler** 被调用。


### 如何扩展自己的富媒体消息

继承于 AVIMTypedMessage，开发者也可以扩展自己的富媒体消息。其要求和步骤是：

* 实现新的消息类型，继承自 AVIMTypedMessage。这里需要注意两点：
  * 在 class 上增加一个 @AVIMMessageType(type=123) 的 Annotation，具体消息类型的值（`123`）由开发者自己决定（LeanCloud 内建的消息类型使用负数，所有正数都预留给开发者扩展使用）。
  * 在消息内部属性上要增加 @AVIMMessageField(name="") 的 Annotation，name 为可选字段在声明字段属性，同时自定义的字段要有对应的 getter/setter 方法。
* 调用 `AVIMMessageManager.registerAVIMMessageType(Class<? extends AVIMTypedMessage> messageType)` 函数进行类型注册
* 调用 `AVIMMessageManager.registerMessageHandler(Class<? extends AVIMMessage> clazz, MessageHandler<?> handler)` 函数进行消息处理 handler 注册。

AVIMTextMessage 的源码如下，可供参考：

```
@AVIMMessageType(type = -1)
public class AVIMTextMessage extends AVIMTypedMessage {

  @AVIMMessageField(name = "_lctext")
  String text;
  @AVIMMessageField(name = "_lcattrs")
  Map<String, Object> attrs;

  public String getText() {
    return this.text;
  }

  public void setText(String text) {
    this.text = text;
  }

  public Map<String, Object> getAttrs() {
    return this.attrs;
  }

  public void setAttrs(Map<String, Object> attr) {
    this.attrs = attr;
  }
}
```

群组聊天
-------------

与前面的单聊类似，群组聊天也需要先建立一个对话（AVIMConversation），然后发送、接收新的消息。

### 创建群组 ###

和单聊类似，建立一个多人聊天的群组也是很简单的。例如：

```
Map<String, Object> attr = new HashMap<String, Object>();
attr.put("type", ConversationType_Group);
imClient.createConversation(clientIds, attr, new AVIMConversationCreatedCallback() {
  @Override
  public void done(AVIMConversation conversation, AVException e) {
    if (null != conversation) {
      // 成功了！
      Intent intent = new Intent(currentActivity, ChatActivity.class);
      Intent.putExtra(“conversation”, conversation);
      currentActivity.startActivity(intent);
    }
  }
});
```

成功之后，我们就可以进入聊天界面了。

### 往群组发送消息 ###

发送消息非常简单，与前面单聊的场景一样。

我们会注意到，AVIMConversation 还有一个发送消息的方法：

```
public void sendMessage(final AVIMMessage message, final int messageFlag,
      final AVIMConversationCallback callback)
```

而这里 flag 的定义有如下三种类型：

* 暂态消息（AVIMConversation.TRANSIENT_MESSAGE_FLAG）。这种消息不会被自动保存（以后在历史消息中无法找到它），也不支持延迟接收，离线用户更不会收到推送通知，所以适合用来做控制协议。譬如聊天过程中「某某正在输入中...」这样的状态信息，就适合通过暂态消息来发送。
* 普通消息（AVIMConversation.NONTRANSIENT_MESSAGE_FLAG）。这种消息就是我们最常用的消息类型，在 LeanCloud 云端会自动保存起来，支持延迟接收和离线推送，以后在历史消息中可以找到它。
* 待回执消息（AVIMConversation.RECEIPT_MESSAGE_FLAG）。这**也是一种普通消息**，只是消息被对方收到之后 LeanCloud 服务端会发送一个回执通知给发送方（这就是 AVIMMessageHandler 中 `public void onMessageReceipt(AVIMMessage message, AVIMConversation conversation, AVIMClient client)` 函数被调用的时机）。

### 接收群组消息 ###

接收一个群组的消息，与接收单聊的消息也是一样的。

### 成员管理 ###

在查询到聊天室成员之后，可以让用户邀请一些自己的朋友加入，作为管理员也可以剔除一些「可怕」的成员。
加入新成员的 API 如下：

```
// 假设需要邀请 Alex，Ben，Chad 三人加入对话
List<String> userIds = new ArrayList<String>();
userIds.add("Alex");
userIds.add("Ben");
userIds.add("Chad");
conversation.addMembers(userIds, new AVIMConversationCallback() {
  @Override
  public void done(AVException error) {
    if (null != error) {
      // 加入失败，报错.
      error.printStackTrace();
    } else {
      // 发出邀请，此后新成员就可以看到这个对话中的所有消息了。
      Logger.d("invited.");
    }
  }
});
```

邀请成功以后，相关方收到通知的时序是这样的：
     
        操作者（管理员）                    被邀请者                        其他人
    1, 发出请求 addMembers
    2,                               收到 onInvited 通知
    3, 收到 onMemberJoined 通知      收到 onMemberJoined 通知      收到 onMemberJoined 通知
   
相应地，踢人时的调用 API 是：

```
List<String> userIds = new ArrayList<String>();
userIds.add("Alex");
conversation.kickMembers(userIds, new AVIMConversationCallback() {
  @Override
  public void done(AVException error) {
    if (null != error) {
      // 失败，报错.
      error.printStackTrace();
    } else {
      // 成功。
      Logger.d("kicked.");
    }
  }
});
```

踢人时，相关方收到通知的时序如下：

        操作者（管理员）                被踢者                       其他人
    1, 发出请求 kickMembers
    2,                          收到 onKicked 通知
    3, 收到 onMemberLeft 通知                             收到 onMemberLeft 通知

> 注意！
> 如果邀请、踢人操作发生的时候，被邀请者/被踢者当前不在线，那么通知消息并不会被离线缓存，所以他们再上线的时候将不会收到通知。

### 获取历史消息 ###

LeanMessage 会将非暂态消息自动保存在云端，之后开发者可以通过 AVIMConversation 来获取该对话的所有历史消息。获取历史消息的 API 如下：

    String oldestMsgId;
    long oldestMsgTimestamp;
    conversation.queryMessages(oldestMsgId,oldestMsgTimestamp, limit, new AVIMHistoryMessageCallback(){
      @Override
      public void done(List<AVIMMessage> messages, AVException e) {
        if (null != e) {
          // 出错了:(
        } else {
          // 成功，可以将消息加入缓存，同时更新 UI
        }
      }
    });

> 注意：
> 获取历史消息的时候，LeanCloud 云端是从某条消息开始，往前查找开发者指定的 N 条消息，返回给客户端。为此，获取历史消息需要传入三个参数：起始消息的 msgId，起始消息的发送时间戳，需要获取的消息条数。

通过这一 API 拿到的消息就是 AVIMMessage 或者 AVIMTypedMessage 实例数组，开发者可以像之前收到新消息通知一样处理。

### 启用离线消息推送（仅对 iOS 平台用户有效）

不管是单聊还是群聊，当用户 A 发出消息后，如果目标对话中有部分用户当前不在线，LeanCloud 云端可以提供离线推送的方式来提醒用户。这一功能默认是关闭的，你可以在 LeanCloud 应用控制台中开启它。开启方法如下：

* 登录 LeanCloud 应用控制台，选择正确的应用进入；
* 选择最顶端的「消息」服务，依次点击左侧菜单「实时消息」->「设置」；
* 在右侧「iOS 用户离线时的推送内容」下填好你要推送出去的消息内容，保存；

这样 iOS 平台上的用户就可以收到 Push Notification 了（当然，前提是应用本身申请到了 RemoteNotification 权限，也将正确的推送证书上传到了 LeanCloud 控制台）。

### 群组消息免打扰（仅对 iOS 平台用户有效）

不管是单聊还是群聊，对于发往普通的 Conversation 的普通消息，如果接收方当前不在线，LeanCloud 云端支持通过 Push Notification 的方式进行提醒。一般情况下这都是很好的，但是如果某个群组特别活跃，那离线用户就会收到过多的推送，会形成不小的干扰。

对此 LeanCloud IM 服务也允许单个用户来关闭/打开某个对话的离线推送功能。

### 搜索群组 ###

不管是单聊，还是群聊，在 LeanCloud IM SDK 里面都是对话（Conversation）。我们给对话设置了如下几种属性：

* conversationId，字符串，对话 id，只读，对话创建之后由 LeanCloud 云端赋予一个全局唯一的 id。
* creator，字符串，对话创建者 id，只读，标识对话创建者信息
* members，数组，对话参与者，这里记录了所有的参与者
* name，字符串，对话的名字，optional，可用来对于群组命名
* attributes，Map/Dict，自定义属性，optional，供开发者自己扩展用。

我们提供了专门的类，来搜索特定的群组：通过 `imClient.getQuery()` 得到一个 `AVIMConversationQuery` 实例，然后调用 `AVIMConversationQuery.wherexxx` 系列方法来增加约束条件。例如要搜索当前登录用户参与的所有群聊对话，其代码为

```
// 搜索 Tom 参与的所有群组对话
List<String> clients = new ArrayList<String>();
clients.add("Tom");
AVIMConversationQuery conversationQuery = imClient.getQuery();
conversationQuery.containsMember(clients);

// 之前有常量定义：
// const int ConversationType_OneOne = 0;
// const int ConversationType_Group = 1;
conversationQuery.whereEqualTo("attr.type", ConversationType_Group);

conversationQuery.findInBackground(new AVIMConversationQueryCallback(){
  @Override
  public void done(List<AVIMConversation> conversations, AVException e) {
    if (null != e) {
      // 出错了。。。
      e.printStackTrace();
    } else {
      if (null != conversation) {
        Logger.d("找到了符合条件的 " + conversations.size() + " 个对话");
      } else {
        Logger.d("没有找到符合条件的对话");
      }
    }
  }
});
```

`AVIMConversationQuery` 中设置条件的方法与 `AVQuery` 类似。这里 `conversationQuery.containsMember()` 表示对话的成员中至少包含这些人员，可用来根据部分成员查找对话；与此类似的还有一个 `conversationQuery.withMembers()` 则表示有且仅有这些成员，用来根据所有成员查找目标对话；`conversationQuery.whereXXX()` 系列方法可用来限定对话名称和自定义属性，这里要强调的一点是，对于自定义属性的约束条件，属性名一定要以 `attr` 开头，如上例所示，限定额外的 `type` 条件的时候需要指定的属性名是 `attr.type`。具体可以参看其头文件。


开放聊天室
-------------
开放聊天室（也叫暂态对话）可以用于很多地方，譬如弹幕、直播等等。在 LeanCloud IM SDK 中，开放聊天室是一类特殊的群组，它也支持创建、加入/踢出成员等操作，消息记录会被保存并可供获取；与普通群组不一样的地方具体体现为：

* 不支持查询成员列表，你可以通过相关 API 查询在线人数；
* 不支持离线消息、离线推送通知等功能；
* 没有成员加入、离开的通知；
* 一个用户一次登录只能加入一个开放聊天室，加入新的开放聊天室后会自动离开原来的聊天室；
* 加入后半小时内断网重连会自动加入原聊天室，超过这个时间则需要重新加入；

### 创建开放聊天室 ###

和普通的群组类似，建立一个开放聊天室也是很简单的，只是在 `AVIMClient.createConversation(conversationMembers, name, attributes, isTransient, callback)` 中我们需要传入 `isTransient=true` 选项。例如：

```
Map<String, Object> attr = new HashMap<String, Object>();
attr.put("type", ConversationType_Group);
imClient.createConversation(clientIds, name, attr, true, new AVIMConversationCreatedCallback() {
  @Override
  public void done(AVIMConversation conversation, AVException e) {
    if (null != conversation) {
      // 成功了，进入聊天室
      Intent intent = new Intent(currentActivity, ChatActivity.class);
      Intent.putExtra(“conversation”, conversation);
      currentActivity.startActivity(intent);
    }
  }
});
```

创建成功之后，我们就可以进入聊天界面了。开放聊天室的其他操作，都与普通群组操作一样。

### 加入开放聊天室
假定任何终端用户都可以加入开放聊天室。作为开发者，我们可以通过通过特定条件检索到所有开放聊天室，然后允许用户自由加入，其示例代码为：

```
conversation.join(new AVIMConversationCallback(){
  @Override
  public void done(AVException e) {
    if (null != e) {
      // 出错了:(
    } else {
      // 成功，此时可以进入聊天界面了。。。
      Intent intent = new Intent(currentActivity, ChatActivity.class);
      Intent.putExtra(“conversation”, conversation);
      currentActivity.startActivity(intent);
    }
  }
});
```

### 查询在线人数 ###
通过 `AVIMConversation.getMemberCount()` 方法可以实时查询开放聊天室的在线人数。示例代码如下：

```
conversation.getMemberCount(new AVIMConversationMemberCountCallback(){
  @Override
  public void done(Integer memberCount, AVException e) {
    if (null != e) {
      // 出错了:(
    } else {
      // 成功，此时 memberCount 的数值就是实时在线人数
    }
  }
});
```

签名和安全
-------------
为了满足开发者对权限和认证的要求，LeanCloud 还设计了操作签名的机制。我们可以在 LeanCloud 应用控制台中的「设置」->「应用选项」->「聊天推送」下面勾选「聊天服务签名认证」来启用签名（强烈推荐这样做）。启用后，所有的用户登录、对话创建/加入、邀请成员、踢出成员等操作都需要验证签名，这样开发者就可以对消息进行充分的控制。

客户端这边究竟该如何使用呢？我们只需要实现 SignatureFactory 接口，然后在用户登录之前，把这个接口的实例赋值给 AVIMClient 即可（`AVIMClient.setSignatureFactory(factory)`）。

设定了 signatureFactory 之后，对于需要鉴权的操作，LeanCloud IM SDK 与服务器端通讯的时候都会带上应用自己生成的 Signature 信息，LeanCloud 云端会使用 app 的 masterKey 来验证信息的有效性，保证聊天渠道的安全。

对于 SignatureFactory 接口，我们只需要实现这两个函数即可：

```
  /**
   * 实现一个基础签名方法 其中的签名算法会在SessionManager和AVIMClient(V2)中被使用
   */
  public Signature createSignature(String peerId, List<String> watchIds) throws SignatureException;

  /**
   * 实现AVIMConversation相关的签名计算
   */
  public Signature createConversationSignature(String conversationId, String clientId,
      List<String> targetIds, String action) throws SignatureException;
```

`createSignature` 函数会在用户登录的时候被调用，`createConversationSignature` 会在对话创建/加入、邀请成员、踢出成员等操作时被调用。

你需要做的就是按照前文所述的签名算法实现签名，其中 `Signature` 声明如下：

```
public class Signature {
  public List<String> getSignedPeerIds();
  public void setSignedPeerIds(List<String> signedPeerIds);

  public String getSignature();
  public void setSignature(String signature);

  public long getTimestamp();
  public void setTimestamp(long timestamp);

  public String getNonce();
  public void setNonce(String nonce);
}
```

其中四个属性分别是:

* signature 签名
* timestamp 时间戳，单位秒
* nonce 随机字符串 nonce
* signedPeerIds 放行的 clientId 列表，v2 中已经**废弃不用**

下面的代码展示了基于 LeanCloud 云代码进行签名时，客户端的实现片段，你可以参考它来完成自己的逻辑实现：

```
public class KeepAliveSignatureFactory implements SignatureFactory {
 @Override
 public Signature createSignature(String peerId, List<String> watchIds) {
   Map<String,Object> params = new HashMap<String,Object>();
   params.put("self_id",peerId);
   params.put("watch_ids",watchIds);

   try{
     Object result =  AVCloud.callFunction("sign",params);
     if(result instanceof Map){
       Map<String,Object> serverSignature = (Map<String,Object>) result;
       Signature signature = new Signature();
       signature.setSignature((String)serverSignature.get("signature"));
       signature.setTimestamp((Long)serverSignature.get("timestamp"));
       signature.setNonce((String)serverSignature.get("nonce"));
       return signature;
     }
   }catch(AVException e){
     throw (SignatureFactory.SignatureException) e;
   }
   return null;
 }

  @Override
  public Signature createConversationSignature(String convId, String peerId, List<String> targetPeerIds,String action){
   Map<String,Object> params = new HashMap<String,Object>();
   params.put("self_id",peerId);
   params.put("group_id",convId);
   params.put("group_peer_ids",targetPeerIds);
   params.put("action",action);

   try{
     Object result = AVCloud.callFunction("group_sign",params);
     if(result instanceof Map){
        Map<String,Object> serverSignature = (Map<String,Object>) result;
        Signature signature = new Signature();
        signature.setSignature((String)serverSignature.get("signature"));
        signature.setTimestamp((Long)serverSignature.get("timestamp"));
        signature.setNonce((String)serverSignature.get("nonce"));
        return signature;
     }
   }catch(AVException e){
     throw (SignatureFactory.SignatureException) e;
   }
   return null;
  }
}
```
