{% extends "./realtime_guide.tmpl" %}

{% block language %}Android{% endblock %}

{% block setup_init %}在 Application 的 `onCreate` 方法中对实时通信服务进行初始化：

```java
public class MyApplication extends Application{

    public void onCreate(){
      ...
      // 你的 AppID、AppKey
      AVOSCloud.initialize(this,"{{appid}}","{{appkey}}");
      ...
    }
}
```

并在 AndroidManifest.xml 中间声明：

```xml
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
```{% endblock %}

{% block demo %}
* [LeanMessage](https://github.com/leancloud/LeanMessage-Demo)（推荐）
* [LeanChat](https://github.com/leancloud/leanchat-android)
{% endblock %}

{% block oneOnOneChat_sent %}
```
- 初始化 ClientId = Tom
- Tom 登录到系统
- 向 Jerry 发送消息：'耗子，起床！' 
```
{% endblock %}

{% block avoidCreatingDuplicateConversation %}
>提示：每次调用 `createConversation()` 方法，都会生成一个新的 Conversation 实例，即便使用相同 conversationMembers 和 name 也是如此。因此必要时可以先使用 `AVIMConversationQuery` 进行查询，避免重复创建。
{% endblock %}

{% block oneOnOneChat_received %}
```
- 自定义消息响应类 CustomMessageHandler
- 在 application  的 onCreate() 中注册 CustomMessageHandler
- 初始化 ClientId = Jerry 
- Jerry 登录到系统
- 接收到 Tom 的消息
```
{% endblock %}

{% block oneOnOneChat_received_steps %}
接收消息之前，需要先定义好自己的 `AVIMMessageHandler` 来响应新消息到达的通知，如上例中的 `CustomMessageHandler`。然后通过 `AVIMMessageManager.registerMessageHandler()` 函数来实现绑定。`AVIMMessageManager` 类中还有一个方法 `registerDefaultMessageHandler()` 则用来指定全局默认的消息处理 handler。

> 注意：`AVIMMessageManager.registerDefaultMessageHandler()` 一定要在 `AVIMClient.open()` 之前调用，否则可能导致服务器发回来的部分消息丢失。

然后通过 `AVIMMessageHandler.onMessage()` 函数来接收消息。
{% endblock %}

{% block groupChat_sent %}
```
- 初始化 ClientId = Tom
- Tom 登录到系统
- 建立一个朋友列表 friends：[Jerry, Bob, Harry, William]
- 新建对话，把朋友们列为对话的参与人员
- 发送消息：'Hey，你们在哪儿？'
```
{% endblock %}

{% block groupChat_received %}
```
- 自定义消息响应类 CustomMessageHandler
- 在 application  的 onCreate() 中注册 CustomMessageHandler
- 初始化 ClientId = Bob
- Bob 登录到系统
- 设置接收消息的方法
- Bob 收到消息后又回复了一条：@Tom, 我在 Jerry 家，你跟 Harry 什么时候过来？还有 William 和你在一起么？
```
{% endblock %}

{% block imageMessage_local_sent %}
```
- 初始化 ClientId = Tom
- Tom 登录到系统
- 从系统媒体库获取第一张照片
- 创建图像消息
- 给图像加一个自定义属性：location = '旧金山'
- 图像 Title：'发自我的小米'
- 发送
```
{% endblock %}

{% block imageMessage_url_sent %}
```
- 初始化 ClientId = Tom
- Tom 登录到系统
- 创建与 Jerry 的对话，对话名称是「猫和老鼠」
- 创建图像消息：http://pic2.zhimg.com/6c10e6053c739ed0ce676a0aff15cf1c.gif
- 加入文本：萌妹子一枚
- 发送
```
{% endblock %}

{% block imageMessage_received_intro %}
{% endblock %}

{% block imageMessage_received %}
{% endblock %}

{% block audioMessage_local_sent %}
```
- 初始化 ClientId = Tom
- Tom 登录到系统
- 创建与 Jerry 的对话，对话名称为「猫和老鼠」
- 本地读取音频文件：'忐忑.mp3' ，创建音频消息
- 加入文本：'听听人类的神曲~'
- 发送
``` 
{% endblock %}

{% block audioMessage_url_sent %}
```
- 初始化 ClientId = Tom
- Tom 登录到系统
- 创建与 Jerry 的对话，对话名称为「猫和老鼠」
- 从外部链接创建音频消息：http://ac-lhzo7z96.clouddn.com/1427444393952
- 创建音频消息
- 发送
```
{% endblock %}

{% block audioMessage_received_intro %}
{% endblock %}

{% block videoMessage_local_sent %}
```
- 初始化 ClientId = Tom
- Tom 登录到系统
- 创建与 Jerry 的对话，对话名称为「猫和老鼠」
- 打开本地文件夹
- 读取视频文件：'BBC_奶酪.mp4'，创建视频消息
- 发送
```
{% endblock %}

{% block videoMessage_url_sent %}

```
- 初始化 ClientId = Tom
- Tom 登录到系统
- 创建与 Jerry 的对话，对话名称为「猫和老鼠」
- 从外部链接创建视频消息：http://ac-lhzo7z96.clouddn.com/1427267336319
- 发送给 Jerry
```
{% endblock %}

{% block fileMessage_sent %}
```
- 初始化 ClientId = Tom
- Tom 登录到系统
- 创建与 Jerry 的对话，对话名称为「猫和老鼠」
- 打开本地文件夹
- 读取本地文件 leancloud.doc，构造 AVFile
- 发送
```
{% endblock %}

{% block fileMessage_received_intro %}
{% endblock %}

{% block locationMessage_new %}
```
- 1.根据纬度和经度（latitude: 45.0 longitude:34.0）构建 
  AVIMLocationMessage()
- 2. AVGeoPoint 构建
  AVIMLocationMessage(
    AVGeoPoint(31.3853142377, 121.0553079844)
  )
```
{% endblock %}

{% block locationMessage_sent %}
```
- 初始化 ClientId = Tom
- Tom 登录到系统
- 创建与 Jerry 的对话，对话名称为「猫和老鼠」
- 以经度和纬度为参数构建一个地理位置消息 AVIMLocationMessage(138.12454, 52.56461)
- 加入文本：好利来新店！！
//开发者更可以通过具体的设备的 API 去获取设备的地理位置
- 发送
}
```
{% endblock %}

{% block locationMessage_received_intro %}
{% endblock %}

{% block typedMessage_received %}
### 接收富媒体消息

实时通信 SDK 内部封装了对富媒体消息的支持，所有富媒体消息都是从 AVIMTypedMessage 派生出来的。发送的时候可以直接调用 `conversation.sendMessage()` 函数。在接收端，我们也专门增加了一类回调接口 AVIMTypedMessageHandler，其定义为：

```
public class AVIMTypedMessageHandler<T extends AVIMTypedMessage> extends MessageHandler<T> {

  @Override
  public void onMessage(T message, AVIMConversation conversation, AVIMClient client);

  @Override
  public void onMessageReceipt(T message, AVIMConversation conversation, AVIMClient client);
}
```

开发者可以编写自己的消息处理 handler，然后调用 `AVIMMessageManager.registerMessageHandler()` 函数来注册目标 handler。

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

SDK 内部在接收消息时的处理逻辑是这样的：

* 当收到新消息时，实时通信 SDK 会先解析消息的类型，然后找到开发者为这一类型所注册的处理响应 handler，再逐一调用这些 handler 的 onMessage 函数。
* 如果没有找到专门处理这一类型消息的 handler，就会转交给 defaultHandler 处理。

这样一来，在开发者为 `TypedMessage`（及其子类） 指定了专门的 handler，也指定了全局的 defaultHandler 了的时候，如果发送端发送的是通用的 AVIMMessage 消息，那么接受端就是 `AVIMMessageManager.registerDefaultMessageHandler()` 中指定的 handler 被调用；如果发送的是 AVIMTypedMessage（及其子类）的消息，那么接受端就是 `AVIMMessageManager.registerMessageHandler()` 中指定的 handler 被调用。
{% endblock %}

{% block offlineMessage_android %}>**Android 聊天服务是和后台的推送服务共享连接的，所以只要有网络就永远在线，不需要专门做推送。**消息达到后，你可以根据用户的设置来判断是否需要弹出通知。网络断开时，我们为每个对话保存 20 条离线消息。{% endblock %}

{% block attributes %} `attributes` {% endblock %}

{% block customMessage_sent %}
```
- 构造一个 AVIMImageMessage
- 在 Attributes 中加入 location = "拉萨布达拉宫"
- 设置 Title = "这蓝天让我彻底醉了……";
- 发送
```
{% endblock %}

{% block customMessage_received %}
```
- 初始化 ClientId = friend
- 登录到系统
- 接收消息，如果是 Image，读取 Attributes[location]
- //读取的结果就是拉萨布达拉宫
{% endblock %}

{% block customMessage_create %}
继承于 AVIMTypedMessage，开发者也可以扩展自己的富媒体消息。其要求和步骤是：

* 实现新的消息类型，继承自 AVIMTypedMessage。这里需要注意两点：
  * 在 class 上增加一个 @AVIMMessageType(type=123) 的 Annotation，具体消息类型的值（这里是 `123`）由开发者自己决定（LeanCloud 内建的 [消息类型使用负数](#消息类详解)，所有正数都预留给开发者扩展使用）。
  * 在消息内部属性上要增加 @AVIMMessageField(name="") 的 Annotation，name 为可选字段在声明字段属性，同时自定义的字段要有对应的 getter/setter 方法。
* 调用 `AVIMMessageManager.registerAVIMMessageType()` 函数进行类型注册。
* 调用 `AVIMMessageManager.registerMessageHandler()` 函数进行消息处理 handler 注册。

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
{% endblock %}

{% block messagePolicy_sent_method %} `AVIMClient.OnMessageReceived` {% endblock %}

{% block messagePolicy_received_method %}{% endblock %}

{% block messagePolicy_received %}{% endblock %}

{% block conversation_init %}
```
- 初始化 ClientId = Jerry
- Jerry 登录
- 创建朋友列表 friends = [Bob, Harry, William]
- 用 friends 创建新对话
```
{% endblock %}

{% block event_memberJoin %} `onMemberJoined` {% endblock %}

{% block event_memberLeft %} `onMemberLeft` {% endblock %}

{% block event_kicked %} `onKicked` {% endblock %}

{% block event_invited %} `onInvited` {% endblock %}

{% block conversation_join %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 获取  id 为 551260efe4b01608686c3e0f 的对话 //获取 Jerry 创建的对话的 Id，这里是直接从控制台复制了上一节准备工作中所创建的对话的 objectId
- Tom 主动加入到对话中
```
{% endblock %}

{% block conversation_membersChanged %}
```
- 初始化 ClientId = Bob
- Bob 登录
- 设置 MembersChanged 响应
- switch:case 如果事件类型为 MembersJoined
- 获取本次加入的 ClientIds //因为只是 Tom 一人加入，所以只有一个 Id
- //开发者可以继续添加自己的业务逻辑
- break;

```
{% endblock %}

{% block conversation_memebersJoined %}
```
- 初始化 ClientId = Bob
- Bob 登录
- 设置 MembersChanged 响应
- switch:case 如果事件类型为 MembersJoined
- 获取本次加入的 ClientIds //因为只是 Tom 一人加入，所以只有一个 Id
- //开发者可以继续添加自己的业务逻辑
- break; 
- ------------ 以上与上例相同 ---------------
- 获取对话对象 Id = 551260efe4b01608686c3e0f
- 进入对话
- 设置 OnMembersJoined 响应
- 获取本次加入的 ClientIds //还是只有 Tom 一人，所以这样就可以直接读取到 Tom 的 clientId

```
{% endblock %}

{% block conversation_invite %}
```
- 初始化 ClientId = Jerry
- Jerry 登录
- 假定对话 Id = 551260efe4b01608686c3e0f
- 进入对话
- Jerry 把 Mary 加入到对话 //AddMembers
```
{% endblock %}

{% block conversation_invite_events %}
邀请成功以后，相关方收到通知的时序是这样的：

No.|邀请者|被邀请者|其他人
---|---|---|---
1|发出请求 addMembers| | 
2| |收到 onInvited 通知| 
3|收到 onMemberJoined 通知| | 收到 onMemberJoined 通知
{% endblock %}

{% block conversation_left %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 假定对话 Id = 551260efe4b01608686c3e0f //由 Jerry 创建的对话
- 进入对话
- Tom 主动从对话中退出
``` 
{% endblock %}

{% block conversation_kick %}
```
- 初始化 ClientId = William
- William 登录
- 对话 Id = 551260efe4b01608686c3e0f //由 Jerry 创建的对话
- 进入对话
- William 把 Harry 从对话中踢出去 //RemoveMembers
```
{% endblock %}

{% block conversation_kick_events %}
踢人时，相关方收到通知的时序如下：

No.|操作者（管理员）|被踢者|其他人
---|---|---|---
1|发出请求 kickMembers| | 
2| |收到 onKicked 通知| |
3|收到 onMemberLeft 通知| |收到 onMemberLeft 通知
{% endblock %}

{% block conversation_countMember_method %} `conversation:countMembersWithCallback:` {% endblock %}

{% block conversation_countMember %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 获取对话列表，找到第一个对话
- 获取该对话成员数量
```
{% endblock %}

{% block conversation_name %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 创建对话，同时邀请 Black，对话名称为 '喵星人'
```
{% endblock %}

{% block conversation_changeName %}
```
- 初始化 ClientId = Black
- Black 登录
- 进入 Tom 创建的对话「喵星人」，id = 55117292e4b065f7ee9edd29
- 修改对话名称为「聪明的喵星人」
- 保存到云端
```
{% endblock %}

{% block conversation_mute %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 进入对话：id = 551260efe4b01608686c3e0f
- 将其设置为静音 Mute
```
{% endblock %}

{% block conversation_tag %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 创建属性 attr 列表对象
- 加入 tag = "private"
- 创建与 Jerry 的对话，对话名称「猫和老鼠」，传入刚加的 attr.tag
```
{% endblock %}

{% block conversation_getSingle %}

```
- 初始化 ClientId = Tom
- Tom 登录
- 异步从服务器拉取对话：id = 551260efe4b01608686c3e0f
```
{% endblock %}

{% block conversation_getList %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 获取对话列表
```
{% endblock %}

{% block conversation_messageHistoryByLimit %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 进入对话：id = 551260efe4b01608686c3e0f
- 将其设置为静音 Mute
- 初始化 ClientId = Tom
- Tom 登录
- 获取最近的 10 条消息 //limit 取值范围 1~1000 之内的整数，默认为 20
```
{% endblock %}

{% block conversation_messageHistoryBeforeId %}
```
- ...//前几步与上例相同
- Tom 登录
- 获取消息历史，不指定 limit //  不使用 limit 默认返回 20 条消息
- 获取这 20 条中最早那条消息的信息
- 再获取之前的消息，不指定 limit // 依然默认返回 20 条消息
```
{% endblock %}

{% block conversation_query_equalTo %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 构建 attr 属性中 topic 是 movie 的查询
- 执行查询
```
{% endblock %}

{% block conversation_query_notEqualTo %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 构建查询条件：attr.type 不等于 "private" 
- limit 设为 50 //默认为 10 个
- 执行查询
```
{% endblock %}

{% block conversation_query_greaterThan %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 构建查询条件：attr.age > 18
- 执行查询
```
{% endblock %}

{% block conversation_query_regexIntro %}
匹配查询是指在 `AVIMConversationQuery` 的查询条件中使用正则表达式来匹配数据。
{% endblock %}

{% block conversation_query_regex %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 构建查询条件：attr.tag 是中文 // 正则为 [\u4e00-\u9fa5] 
- 执行查询
```
{% endblock %}

{% block conversation_query_contains %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 构建查询条件：attr.keywords 包含 "教育"
- 执行查询
```
{% endblock %}

{% block conversation_query_findJoinedMemebers %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 构建 clientIds 列表：[Bob, Jerry]
- 构建查询条件：对话成员有 Bob 和 Jerry
- 执行查询
```
{% endblock %}

{% block conversation_query_combination %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 构建查询条件：attr.keywords 包含 "教育"、attr.age < 18
- 执行查询
```
{% endblock %}

{% block conversation_query_count %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 构建查询条件：attr.keywords 包含「教育」、attr.age < 18
- 执行查询，获取符合条件的对话的数量
```
{% endblock %}

{% block chatroom_intro %}
和建立普通对话类似，建立一个聊天室只是在 `AVIMClient.createConversation(conversationMembers, name, attributes, isTransient, callback)` 中传入 `isTransient=true`。
{% endblock %}

{% block chatroom_new %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 创建暂态对话，名称 "HelloKitty PK 加菲猫"
```
{% endblock %}

{% block chatroom_count_method %} `AVIMConversation.getMemberCount()` {% endblock %}

{% block chatroom_count %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 获取对话列表中的第一个对话对象
- 获取人数
```
{% endblock %}

{% block chatroom_query_method %} `[AVIMConversationQuery whereKey:]` {% endblock %}

{% block chatroom_query_method2 %} `whereKey:` {% endblock %}

{% block chatroom_query_single %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 获取对话列表中 attr.topic = "奔跑吧，兄弟"、tr = true
- 执行查询
```
{% endblock %}

{% block chatroom_query_history %}
```
- 初始化 ClientId = Tom
- 获取对话对象 id = 2f08e882f2a11ef07902eeb510d4223b
- 获取从过去 24 小时的历史聊天纪录
```
{% endblock %}

{% block networkStatus %}
与网络相关的通知（网络断开、恢复等）会由 `AVIMClientEventHandler` 做出响应，接口函数有：

* `onConnectionPaused()` 指网络连接断开事件发生，此时聊天服务不可用。
* `onConnectionResume()` 指网络连接恢复正常，此时聊天服务变得可用。

在网络中断的情况下，所有的消息收发和对话操作都会出现问题。

通过 `AVIMClient.setClientEventHandler()` 可以设定全局的客户端事件响应（ClientEventHandler）。
{% endblock %}

{% block conversation_security %}
客户端这边究竟该如何使用呢？我们只需要实现 SignatureFactory 接口，然后在用户登录之前，把这个接口的实例赋值给 AVIMClient 即可（`AVIMClient.setSignatureFactory(factory)`）。

设定了 signatureFactory 之后，对于需要鉴权的操作，实时通信 SDK 与服务器端通讯的时候都会带上应用自己生成的 Signature 信息，LeanCloud 云端会使用 app 的 masterKey 来验证信息的有效性，保证聊天渠道的安全。

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
{% endblock %}
