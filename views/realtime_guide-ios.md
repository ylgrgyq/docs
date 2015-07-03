{% extends "./realtime_guide.tmpl" %}

{% block language %}iOS{% endblock %}

{% block setup_init %}
实时通信 SDK 包含在 `AVOSCloudIM.framework` 中，它依赖于 `AVOSCloud.framework` 这一核心库。在使用之前，请首先确保添加了如下依赖库：

- SystemConfiguration.framework
- MobileCoreServices.framework
- CoreTelephony.framework
- CoreLocation.framework
- libicucore.dylib

然后我们需要在 application 的 `applicationDelegate` 函数中对实时通信 SDK 进行初始化：

```
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    // 其他处理...
    ...
    //"你的 AppId", "你的 AppKey"
    [AVOSCloud setApplicationId:@"{{appid}}" clientKey:@"{{appkey}}"];
    ...
}
```
{% endblock %}

{% block demo %}
* [LeanMessage](https://github.com/leancloud/LeanMessage-Demo)（推荐）
* [LeanChat](https://github.com/leancloud/leanchat-ios)
{% endblock %}

{% block oneOnOneChat_sent %}
```
- 初始化 ClientId = Tom
- Tom 登录到系统
- 向 Jerry 发送消息：'耗子，起床！' 
```
{% endblock %}

{% block avoidCreatingDuplicateConversation %}
>提示：每次调用 `createConversationWithName:` 方法，都会生成一个新的 Conversation 实例，即便使用相同 clientIds 和 name 也是如此。因此必要时可以先使用 `AVIMConversationQuery` 来查询，避免重复创建。
{% endblock %}

{% block oneOnOneChat_received %}
```
- 初始化 ClientId = Jerry 
- Jerry 登录到系统
- 设置接收消息的方法
```
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
- 初始化 ClientId = Bob
- Bob 登录到系统
- 设置接收消息的方法
- Bob 收到消息后又回复了一条：@Tom, 我在 Jerry 家，你跟 Harry 什么时候过来？还有 William 和你在一起么？
```
{% endblock %}

{% block textMessage_sent_intro %}
发送文本信息可以直接调用 `[AVIMConversation sendMessage:callback:]` 函数。{% endblock %}

{% block textMessage_sent_method %} `sendMessage` {% endblock %}

{% block textMessage_received_intro %}
实时通信 SDK 大量采用回调来返回操作结果，但是对于一些被动的消息通知、网络断开与恢复等通知，则是采用 delegate（代理）来实现，即 AVIMClientDelegate。

要显示 Tom 发过来的文本消息，我们需要调用 `AVIMClientDelegate`（客户端事件代理）的主要接口 `conversation:didReceiveCommonMessage:` 或 `conversation:didReceiveTypedMessage:` 来实现。
{% endblock %}

{% block textMessage_received %}
```
- 初始化 ClientId = Jerry
- Jerry 登录到系统
- 进入与 Tom 的对话 //假设 ConversationId = 55117292e4b065f7ee9edd29
- //收到 Tom 的消息：'耗子，起床！'
- Jerry 回复 '早起了。啥事？'
```
{% endblock %}

{% block imageMessage_local_sent %}
```
- 初始化 ClientId = Tom
- Tom 登录到系统
- 从系统媒体库获取第一张照片
- 创建图像消息
- 给图像加一个自定义属性：location = '旧金山'
- 图像 Title：'发自我的 iPhone'
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
在接收图像消息这种富媒体消息时，需要使用 `conversation:didReceiveTypedMessage:` 方法。实际上接收所有富媒体消息都是如此，因为它们都是从 `AVIMTypedMessage` 派生出来的。相关内容可以在下面的 [消息类详解](#消息类详解) 中找到。
{% endblock %}

{% block imageMessage_received %}
```
- 初始化 ClientId = Jerry
- Jerry 登录到系统
- 获取对话 Id = 55117292e4b065f7ee9edd29
- 收取图像，获取相关元数据 MessageId、FromClientId、URL、Size、Width、Height、Format 等
```
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
与接收图像消息类似，需要使用 `conversation:didReceiveTypedMessage:` 方法来响应，实例代码请参照 [图像消息接收](#接收图像消息)。
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
与接收图像消息类似，由 `AVIMConversation` 的 `OnFileMessageReceived` 方法来响应，实例代码请参照 [图像消息接收](#接收图像消息)。
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
与接收图像消息类似， 由 `AVIMConversation` 的 `OnLocationMessageReceived` 方法来响应，实例代码请参照 [图像消息接收](#接收图像消息)。
{% endblock %}

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
继承于 `AVIMTypedMessage`，开发者也可以扩展自己的富媒体消息。其要求和步骤是：

* 实现 `AVIMTypedMessageSubclassing` 协议
* 子类将自身类型进行注册，一般可在 application 的 `applicationDelegate` 方法里面调用 [YourClass registerSubclass];
{% endblock %}

{% block messagePolicy_received_method %} `conversation:didReceiveCommonMessage:` {% endblock %}

{% block messagePolicy_received %}
实时通信 SDK 内部封装了对富媒体消息的支持，所有富媒体消息都是从 AVIMTypedMessage 派生出来的。发送的时候可以直接调用 [AVIMConversation sendMessage:callback:] 函数。在接收端，我们也在 `AVIMClientDelegate` 中专门增加了一个回调函数：

```
- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message;
```
这样，如果发送端发送的是 AVIMMessage 消息，那么接受端就是 `conversation:didReceiveCommonMessage:` 被调用；如果发送的是 AVIMTypedMessage（及其子类）的消息，那么接受端就是 `conversaion:didReceiveTypedMessage` 被调用。
{% endblock %}

{% block offlineMessage %}
这样 iOS 平台上的用户就可以收到消息推送了。当然，前提是应用本身申请到了 RemoteNotification 权限，也将正确的推送证书上传到了 LeanCloud 控制台。
{% endblock %}

{% block conversation_init %}
```
- 初始化 ClientId = Jerry
- Jerry 登录
- 创建朋友列表 friends = [Bob, Harry, William]
- 用 friends 创建新对话
```
{% endblock %}

{% block event_memberJoin %} `membersAdded` {% endblock %}

{% block event_memberLeft %} `membersRemoved` {% endblock %}

{% block event_kicked %} `kickedByClientId` {% endblock %}

{% block event_invited %} `invitedByClientId` {% endblock %}

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
- 构建查询条件 attr.type 不等于 private 
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
- 构建 attr.tag 是中文的查询 // 正则为 [\u4e00-\u9fa5] 
- 执行查询
```
{% endblock %}

{% block conversation_query_contains %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 构建 attr.keywords 包含「教育」的查询
- 执行查询
```
{% endblock %}

{% block conversation_query_findJoinedMemebers %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 构建 clientIds 列表：[Bob, Jerry]
- 构建对话成员有 Bob 和 Jerry 的查询条件
- 执行查询
```
{% endblock %}

{% block conversation_query_combination %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 构建查询条件：attr.keywords 包含「教育」、attr.age < 18
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
创建一个聊天室跟创建一个普通对话差不多，只是在 `[imClient createConversationWithName:clientIds:attributes:options:callback:]` 中给 `options:` 传入特定的选项值 `AVIMConversationOptionTransient`。
{% endblock %}

{% block chatroom_new %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 创建暂态对话，名称 "HelloKitty PK 加菲猫"
```
{% endblock %}

{% block chatroom_count_method %} [AVIMConversation countMembersWithCallback:]` {% endblock %}

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
与网络相关的通知（网络断开、恢复等）要采用 `AVIMClientDelegate` 代理方式来实现，主要接口如下：

* `imClientPaused:(AVIMClient *)imClient` 指网络连接断开事件发生，此时聊天服务不可用。
* `imClientResuming:(AVIMClient *)imClient` 指网络断开后开始重连，此时聊天服务依然不可用。
* `imClientResumed:(AVIMClient *)imClient` 指网络连接恢复正常，此时聊天服务变得可用。

在网络中断的情况下，所有的消息收发和对话操作都会出现问题。
{% endblock %}

{% block conversation_security %}
客户端这边究竟该如何使用呢？我们只需要实现 AVIMSignatureDataSource 协议接口，然后在用户登录之前，把这个接口赋值给 `AVIMClient.signatureDataSource` 即可。示例代码如下：

```
AVIMClient *imClient = [[AVIMClient alloc] init];
imClient.delegate = self;
imClient.signatureDataSource = signatureDelegate;
[imClient openWithClientId:@“Tom” callback:^(BOOL succeeded, NSError *error){
    if (error) {
        // 出错了，可能是网络问题无法连接 LeanCloud 云端，请检查网络之后重试。
        // 此时聊天服务不可用。
        UIAlertView *view = [[UIAlertView alloc] initWithTitle:@"聊天不可用！" message:[error description] delegate:nil cancelButtonTitle:@"OK" otherButtonTitles:nil];
        [view show];
    } else {
        // 成功登录，可以开始进行聊天了。
    }
}];
```

设定了 signatureDataSource 之后，对于需要鉴权的操作，LeanCloud IM SDK 与服务器端通讯的时候都会带上应用自己生成的 Signature 信息，LeanCloud 云端会使用 app 的 masterKey 来验证信息的有效性，保证聊天渠道的安全。

对于 AVIMSignatureDataSource 接口，我们只需要实现这一个函数即可：

```
/*!
 对一个操作进行签名. 注意:本调用会在后台线程被执行
 @param clientId - 操作发起人的 id
 @param conversationId － 操作所属对话的 id
 @param action － 操作的种类，主要有：
                "join": 表示操作发起人要加入对话
                "invite": 表示邀请其他人加入对话
                "kick": 表示从对话中踢出部分人
 @param clientIds － 操作目标的 id 列表
 @return 一个 AVIMSignature 签名对象.
 */
- (AVIMSignature *)signatureWithClientId:(NSString *)clientId
                          conversationId:(NSString *)conversationId
                                  action:(NSString *)action
                       actionOnClientIds:(NSArray *)clientIds;
```

你需要做的就是按照前文所述的签名算法实现签名，其中 `AVIMSignature` 声明如下：

```
@interface AVIMSignature : NSObject

@property (nonatomic, strong) NSString *signature;
@property (nonatomic) int64_t timestamp;
@property (nonatomic, strong) NSString *nonce;
@property (nonatomic, strong) NSError *error;

@end
```

其中四个属性分别是：

* signature 签名
* timestamp 时间戳，单位秒
* nonce 随机字符串 nonce
* error 签名错误信息

在启用签名功能的情况下，LeanCloud IM SDK 在进行一些重要操作前，都会首先请求 `AVIMSignatureDataSource` 接口，获取签名信息 `AVIMSignature`，然后把操作信息和第三方签名一起发给 LeanCloud 云端，由云端根据签名的结果来对操作进行处理。 

{% endblock %}
