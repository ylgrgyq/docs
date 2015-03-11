
系统依赖库
-------------
> 开始之前
> 在看下面的内容之前，我们假设您已经看过我们的[实时通信开发指南（v2）](./realtime_v2.html)，了解了基本的概念和模型。

注意 请首先确保你添加了如下依赖库：

- SystemConfiguration.framework
- MobileCoreServices.framework
- CoreTelephony.framework
- CoreLocation.framework
- libicucore.dylib


一对一的文本聊天
-------------

我们先从最简单的环节入手，看看怎么用 LeanCloud IM SDK v2 实现一对一文本聊天。

### 消息发送

首先我们需要在 application 的 `applicationDelegate` 函数中进行 LeanCloud IM SDK 最基本的初始化：

```
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    // do other initialize...
    ...
    [AVOSCloud setApplicationId:@"yourAppID" clientKey:@"yourAppKey"];
    ...
}
```

接下来，我们需要完成用户（假定 Tom，为直观起见，我们使用用户名来作为 `clientId`）登录：

    AVIMClient *imClient = [[AVIMClient alloc] init];
    imClient.delegate = self;
    [imClient openWithClientId:@“Tom” callback:^(BOOL succeeded, NSError *error){
        if (error) {
            // 出错了，可能是网络问题无法连接 LeanCloud 云端，请检查网络之后重试。
            // 此时聊天服务不可用。
        } else {
            // 成功登录，可以开始进行聊天了。
        }
    }];

第三步，我们要跟「Bob」这个用户进行聊天，我们先创建一个对话，代码如下：

    AVIMConversationQuery *query = [imClient conversationQuery];
    NSArray *clientIds = [[NSArray alloc] initWithObjects:@"Tom", @"Bob", nil];
    [query whereKey:kAVIMKeyMember containsAllObjectsInArray:clientIds];
    // 之前有常量定义：
    // const int kConversationType_OneOne = 0;
    // const int kConversationType_Group = 1;
    [query whereKey:AVIMAttr(@"type") equalTo:[NSNumber numberWithInt:kConversationType_OneOne]];
    [query findConversationsWithCallback:^(NSArray *objects, NSError *error) {
        if (error) {
            [MessageDisplayer displayError:error];
        } else if (!objects || [objects count] < 1) {
            // 不曾和 Bob 聊过，新建一个对话
            [imClient createConversationWithName:nil
                                       clientIds:clientIds
                                      attributes:@{@"type":[NSNumber numberWithInt:kConversationType_OneOne]}
                                         options:AVIMConversationOptionNone
                                        callback:^(AVIMConversation *conversation, NSError *error) {
                                            if (error) {
                                                // 出错了 :(
                                            } else {
                                                [self openConversation:conversation];
                                            }
                                        }];
        } else {
            // 已经有一个和 Bob 的对话存在，继续在这一对话中聊天
            AVIMConversation *conversation = [objects objectAtIndex:0];
            [self openConversation:conversation];
        }
    }];
    

第四步，我们往对话中发送一条消息：

    AVIMMessage *message = [AVIMMessage messageWithContent:@"hello"];
    [_conversation sendMessage:message callback:^(BOOL succeeded, NSError *error){
    if (error) {
        // 出错了 :(
    } else {
        // 成功！
    }
    }];

好了，这样一条消息就发送过去了。但是问题来了，对于「Bob」而言，他怎么才能收到别人发给他的消息呢？

### 消息接收

在 Bob 这一端，要能接收到消息，需要如下几步：

1，进行初始化和登录，代码与发送端并无二致；

2，实现 AVIMClientDelegate，响应新消息到达通知。主要是如下函数：

- (void)conversation:(AVIMConversation *)conversation didReceiveCommonMessage:(AVIMMessage *)message;

对于 Tom 发过来的消息，要显示出来，我们只需实现 `conversation:didReceiveCommonMessage:` 即可，示例代码如下：

```
-(void)conversation:(AVIMConversation *)conversation didReceiveCommonMessage:(AVIMMessage *)message {
    // 下面的逻辑会把消息直接存入本地数据库缓存。注意：你完全可以根据自己的需要来决定实际如何处理
    [self saveMessageToDatabase:message callback:^(BOOL succeeded, NSError *error) {
        [[NSNotificationCenter defaultCenter] postNotificationName:LC_NOTIFICATION_MESSAGE_UPDATED object:conversation];
    }];
}
```

AVIMClientDelegate
------------
从上面的例子中可以看到，要接收到别人给你发送的消息，需要实现 AVIMClientDelegate 协议。从 v2 版开始，LeanCloud IM SDK 大量采用回调来反馈操作结果，但是对于一些被动的消息通知，则还是采用代理来实现的，包括：

* 对话中有新的消息
* 对话中有新成员加入
* 对话中有成员离开
* 被邀请加入某对话
* 被从某对话中踢出

此外，还有网络相关的通知（网络断开、恢复等），也都是通过 delegate 的方式实现的。

AVIMClientDelegate 的详细定义如下：

```
@protocol AVIMClientDelegate <NSObject>
@optional
/*!
 当前聊天状态被暂停，常见于网络断开时触发。
 */
- (void)imClientPaused:(AVIMClient *)imClient;
/*!
 当前聊天状态开始恢复，常见于网络断开后开始重新连接。
 */
- (void)imClientResuming:(AVIMClient *)imClient;
/*!
 当前聊天状态已经恢复，常见于网络断开后重新连接上。
 */
- (void)imClientResumed:(AVIMClient *)imClient;

/*!
 接收到新的普通消息。
 @param conversation － 所属对话
 @param message - 具体的消息
 @return None.
 */
- (void)conversation:(AVIMConversation *)conversation didReceiveCommonMessage:(AVIMMessage *)message;

/*!
 接收到新的富媒体消息。
 @param conversation － 所属对话
 @param message - 具体的消息
 @return None.
 */
- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message;

/*!
 消息已投递给对方。
 @param conversation － 所属对话
 @param message - 具体的消息
 @return None.
 */
- (void)conversation:(AVIMConversation *)conversation messageDelivered:(AVIMMessage *)message;

/*!
 对话中有新成员加入的通知。
 @param conversation － 所属对话
 @param clientIds - 加入的新成员列表
 @param clientId - 邀请者的 id
 @return None.
 */
- (void)conversation:(AVIMConversation *)conversation membersAdded:(NSArray *)clientIds byClientId:(NSString *)clientId;
/*!
 对话中有成员离开的通知。
 @param conversation － 所属对话
 @param clientIds - 离开的成员列表
 @param clientId - 操作者的 id
 @return None.
 */
- (void)conversation:(AVIMConversation *)conversation membersRemoved:(NSArray *)clientIds byClientId:(NSString *)clientId;

/*!
 被邀请加入对话的通知。
 @param conversation － 所属对话
 @param clientId - 邀请者的 id
 @return None.
 */
- (void)conversation:(AVIMConversation *)conversation invitedByClientId:(NSString *)clientId;

/*!
 从对话中被移除的通知。
 @param conversation － 所属对话
 @param clientId - 操作者的 id
 @return None.
 */
- (void)conversation:(AVIMConversation *)conversation kickedByClientId:(NSString *)clientId;

@end
```
作为开发者，我们实现这一代理接口，就可以处理所有 LeanCloud 云端发过来的通知消息了。


支持富媒体的聊天消息
-------------

上面的代码演示了如何发送简单文本信息，但是现在的交互方式已经越来越多样化，图片、语音、视频已是非常普遍的消息类型。v2 版的 LeanCloud IM SDK 已经可以很好地支持这些富媒体消息，具体说明如下：

### AVIMTypedMessage
所有富媒体消息的基类，其声明为

```
typedef int8_t AVIMMessageMediaType;
//SDK定义的消息类型，LeanCloud SDK 自身使用的类型是负数，所有正数留给开发者自定义扩展类型使用，0 作为「没有类型」被保留起来。
enum : AVIMMessageMediaType {
    kAVIMMessageMediaTypeNone = 0,
    kAVIMMessageMediaTypeText = -1,
    kAVIMMessageMediaTypeImage = -2,
    kAVIMMessageMediaTypeAudio = -3,
    kAVIMMessageMediaTypeVideo = -4,
    kAVIMMessageMediaTypeLocation = -5
};

@interface AVIMTypedMessage : AVIMMessage
@property(nonatomic)AVIMMessageMediaType mediaType;//消息类型，可自定义
@property(nonatomic, strong)NSString *text;        // 消息文本
@property(nonatomic, strong)NSDictionary *attributes;// 自定义属性
@property(nonatomic, strong, readonly)AVFile *file;  // 附件
@property(nonatomic, strong, readonly)AVGeoPoint *location;  // 位置
@end
```

### AVIMTextMessage

AVIMTypedMessage 子类，表示一般的文本消息，其构造函数为

```
@interface AVIMTextMessage : AVIMTypedMessage <AVIMTypedMessageSubclassing>
+ (instancetype)messageWithText:(NSString *)text
                     attributes:(NSDictionary *)attributes;
@end
```

### AVIMImageMessage
AVIMTypedMessage 子类，支持发送图片和附带文本的混合消息，其声明为：

```
@interface AVIMImageMessage : AVIMTypedMessage <AVIMTypedMessageSubclassing>
+ (instancetype)messageWithText:(NSString *)text
               attachedFilePath:(NSString *)attachedFilePath
                     attributes:(NSDictionary *)attributes;

@property(nonatomic, readonly)uint width;
@property(nonatomic, readonly)uint height;
@property(nonatomic, readonly)uint64_t size;
@property(nonatomic, strong, readonly)NSString *format;

@end
```

接收到这样消息之后，开发者可以获取到若干图片元数据（width，height，图片 size，图片 format）和一个包含图片数据的 AVFile 实例。

### AVIMAudioMessage
AVIMTypedMessage 子类，支持发送语音和附带文本的混合消息，其声明为：

```
@interface AVIMAudioMessage : AVIMTypedMessage <AVIMTypedMessageSubclassing>
+ (instancetype)messageWithText:(NSString *)text
               attachedFilePath:(NSString *)attachedFilePath
                     attributes:(NSDictionary *)attributes;

@property(nonatomic, readonly)uint64_t size;
@property(nonatomic, readonly)float duration;
@property(nonatomic, strong, readonly)NSString *format;

@end
```

接收到这样消息之后，开发者可以获取到若干音频元数据（时长 duration、音频 size，音频 format）和一个包含图片数据的 AVFile 实例。

### AVIMVideoMessage
AVIMTypedMessage 子类，支持发送视频和附带文本的混合消息，其声明为：

```
@interface AVIMVideoMessage : AVIMTypedMessage <AVIMTypedMessageSubclassing>
+ (instancetype)messageWithText:(NSString *)text
               attachedFilePath:(NSString *)attachedFilePath
                     attributes:(NSDictionary *)attributes;

@property(nonatomic, readonly)uint64_t size;
@property(nonatomic, readonly)float duration;
@property(nonatomic, strong, readonly)NSString *format;

@end
```

接收到这样消息之后，开发者可以获取到若干视频元数据（时长 duration、视频 size，视频 format）和一个包含图片数据的 AVFile 实例。

### AVIMLocationMessage
AVIMTypedMessage 子类，支持发送地理位置信息和附带文本的混合消息，其声明为：

```
@interface AVIMLocationMessage : AVIMTypedMessage <AVIMTypedMessageSubclassing>
+ (instancetype)messageWithText:(NSString *)text
                       latitude:(float)latitude
                      longitude:(float)longitude
                     attributes:(NSDictionary *)attributes;

@property(nonatomic, readonly)float latitude;
@property(nonatomic, readonly)float longitude;

@end
```

接收到这样的消息之后，开发者可以获取到具体的地理位置数据：

### 如何接收富媒体消息

新版 LeanCloud IM SDK 内部封装了对富媒体消息的支持，所有富媒体消息都是从 AVIMTypedMessage 派生出来的。发送的时候可以直接调用 conversation 的 `sendMessage:callback:` 函数。在接收端，我们也在 AVIMClientDelegate 中专门增加了一个回调函数：

```
- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message;
```

这样，如果发送端发送的是 AVIMMessage 消息，那么接受端就是 **conversation:didReceiveCommonMessage:** 被调用；如果发送的是 AVIMTypedMessage（及其子类）的消息，那么接受端就是 **conversaion:didReceiveTypedMessage** 被调用。

接收端对于富媒体消息的通知处理代码片段如下：

```
- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message {
    if (!conversation || !message) {
        // 出现异常
    } else {
        AVIMMessageMediaType msgType = message.mediaType;
        switch(msgType) {
        case kAVIMMessageMediaTypeText:
            AVIMTextMessage *textMsg = (AVIMTextMessage*)message;
            // 显示文本消息
            break;
        case kAVIMMessageMediaTypeImage:
            AVIMImageMessage *imageMsg = (AVIMImageMessage*)message;
            // 显示图片消息
            break;
        case kAVIMMessageMediaTypeAudio:
            AVIMAudioMessage *audioMsg = (AVIMAudioMessage*)message;
            // 显示音频消息
            break;
        case kAVIMMessageMediaTypeVideo:
            AVIMVideoMessage *videoMsg = (AVIMVideoMessage*)message;
            // 显示视频消息
            break;
        case kAVIMMessageMediaTypeLocation:
            AVIMLocationMessage *locationMsg = (AVIMLocationMessage*)message;
            // 显示位置消息
            break;
        default:
            break;
        }
    }
}
```

### 如何扩展自己的富媒体消息

继承于 AVIMTypedMessage，开发者也可以扩展自己的富媒体消息。其要求和步骤是：

* 实现 AVIMTypedMessageSubclassing 协议
* 子类将自身类型进行注册，一般可在 application 的 `applicationDelegate` 方法里面调用 [YourClass registerSubclass];


群组聊天
-------------

与前面的单聊类似，群组聊天也需要先建立一个对话（AVIMConversation），然后发送、接收新的消息。

### 创建群组 ###

和单聊类似，建立一个多人聊天的群组也是很简单的，我们可以调用一个 API，在建立群组的时候就加入成员并指定名字（注意名字是可选的）。例如：

```
    NSMutableArray *convMembers = [NSMutableArray arrayWithArray:clients];
    if (![clients containsObject:currentUserId]) {
        [convMembers addObject:currentUserId];
    }
    [imClient createConversationWithName:nil
                               clientIds:convMembers
                              attributes:@{@"type":[NSNumber numberWithInt:kConversationType_Group]}
                                 options:AVIMConversationOptionNone
                                callback:^(AVIMConversation *conversation, NSError *error) {
                                    if (error) {
                                        // 出错了 :(
                                    } else {
                                        // 成功，进入聊天界面
                                    }
                                }];
```

加入成功之后，我们就可以进入聊天界面了。

### 往群组发送消息 ###

发送消息非常简单，与前面单聊的场景一样。

### 接收群组消息 ###

接收一个群组的消息，与接收单聊的消息也是一样的。

### 成员管理 ###

在查询到聊天室成员之后，可以让用户邀请一些自己的朋友加入，作为管理员也可以剔除一些「可怕」的成员。
加入新成员的 API 如下：

    NSArray* userIds = @[@"A", @"B", @"C"];
    [conversation addMembersWithClientIds:userIds callback:^(BOOL succeeded, NSError *error) {
    if (error) {
        // 加入失败，报错.
    } else {
        // 加入成功，此后新成员就可以看到这个对话中的所有消息了。
    }];

邀请成功以后，通知的流程是这样的：
     
        操作者（管理员）                       被邀请者                        其他人
    1, 发出请求 addMembers
    2, 收到 invitedByClientId 通知    收到 invitedByClientId 通知
    3, 收到 membersAdded 通知           收到 membersAdded 通知      收到 membersAdded 通知
   
相应地，踢人时的调用 API 是：

    NSArray* userIds = @[@"C"];
    [conversation removeMembersWithClientIds:userIds callback:^(BOOL succeeded, NSError *error) {
    if (error) {
        // 踢出失败，报错.
    } else {
        // 踢出成功，此后被踢出的人就再也收不到这个对话的消息了。
    }];

踢人的通知流程如下：

        操作者（管理员）                被踢者                         其他人
    1, 发出请求 removeMembers
    2,                     收到 kickedByClientId 通知
    3, 收到 membersRemoved 通知                             收到 membersRemoved 通知

> 注意！
> 如果邀请、踢人操作发生的时候，被邀请者/被踢者当前不在线，那么通知消息并不会被离线缓存，所以他们再上线的时候将不会收到通知。

### 获取历史消息 ###

LeanMessage 会将非暂态消息自动保存在云端，之后开发者可以通过 AVIMConversation 来获取该对话的所有历史消息。获取历史消息的 API 如下：

    NSString *oldestMsgId;
    int64_t oldestMsgTimestamp;
    [conversation queryHistoricalMessagesBeforeId:oldestMsgId
                              timestamp:oldestMsgTimestamp
                                  limit:20
                               callback:^(NSArray *objects, NSError *error){
                               if (error) {
                                   // 出错了:(
                               } else {
                                   // 成功
                               }];

> 注意：
> 获取历史消息的时候，LeanCloud 云端是从某条消息开始，往前查找开发者指定的 N 条消息，返回给客户端。为此，获取历史消息需要传入三个参数：起始消息的 msgId，起始消息的发送时间戳，需要获取的消息条数。

通过这一 API 拿到的消息就是 AVIMMessage 或者 AVIMTypedMessage 实例数组，开发者可以像之前收到新消息通知一样处理。

### 群组消息免打扰

不管是单聊还是群聊，对于发往普通的 Conversation 的普通消息，如果接收方当前不在线，LeanCloud 云端支持通过 Push Notification 的方式进行提醒。一般情况下这都是很好的，但是如果某个群组特别活跃，那离线用户就会收到过多的推送，会形成不小的干扰。
对此 LeanCloud IM 服务也允许单个用户来关闭/打开某个对话的离线推送功能。调用 API 如下：

```
    if (open) {
        [_conversation muteWithCallback:^(BOOL succeeded, NSError *error) {
            ...
        }];
    } else {
        [_conversation unmuteWithCallback:^(BOOL succeeded, NSError *error) {
            ...
        }];
    }
```

> 普通的 Conversation？普通消息？这都是什么！
>
> 还记得`[AVIMClient createConversationWithName:clientIds:attributes:options:callback:]`函数吗？这里的`options`我们一般都是指定为`AVIMConversationOptionNone`，这样创建的就是一个普通的对话。其实它还有另一个值`AVIMConversationOptionTransient`，使用这一选项创建出来的就是「暂态」对话。与普通对话相比，暂态对话不支持离线消息与离线推送，也没有成员加入、离开的通知，不支持查询成员列表，但提供当前在线人数查询。
>
> 同样地，消息也存在「暂态」消息这种类型。还记得`[AVIMConversation sendMessage:options:callback:]`这个函数吗？如果`options`设为`AVIMMessageSendOptionNone`，那就是发送的普通消息；如果设为`AVIMMessageSendOptionTransient`那么就是发送的暂态消息。与普通消息相比，暂态消息不会被自动保存到云端，相应地也不会有离线通知了。

### 搜索群组 ###

不管是单聊，还是群聊，在 LeanCloud IM SDK 里面都是对话（Conversation）。我们给对话设置了如下几种属性：

* conversationId，字符串，对话 id，只读，对话创建之后由 LeanCloud 云端赋予一个全局唯一的 id。
* creator，字符串，对话创建者 id，只读，标识对话创建者信息
* members，数组，对话参与者，这里记录了所有的参与者
* name，字符串，对话的名字，optional，可用来对于群组命名
* attributes，Map/Dict，自定义属性，optional，供开发者自己扩展用。

我们提供了专门的类，来搜索特定的群组。例如要搜索当前登录用户参与的所有群聊对话，其代码为

```
    AVIMConversationQuery *query = [imClient conversationQuery];
    [query whereKey:kAVIMKeyMember containedIn:@[[AVUser currentUser].objectId]];
    [query whereKey:AVIMAttr(@"type") equalTo:[NSNumber numberWithInt:kConversationType_Group]];
    [query findConversationsWithCallback:^(NSArray *objects, NSError *error) {
        ...
    }];
```

`AVIMConversationQuery` 中设置条件的方法与 `AVQuery` 类似，具体可以参看其头文件。


签名和安全
-------------
为了满足开发者对权限和认证的要求，LeanCloud 还设计了操作签名的机制。我们可以在 LeanCloud 应用控制台中的「设置」->「应用选项」->「聊天推送」下面勾选「聊天服务签名认证」来启用签名（强烈推荐这样做）。启用后，所有的用户登录、对话创建/加入、邀请成员、踢出成员等操作都需要验证签名，这样开发者就可以对消息进行充分的控制。

客户端这边究竟该如何使用呢？我们只需要实现 AVIMSignatureDataSource 协议接口，然后在用户登录之前，把这个接口赋值给 AVIMClient.signatureDataSource 即可。示例代码如下：

```
    AVIMClient *imClient = [[AVIMClient alloc] init];
    imClient.delegate = self;
    imClient.signatureDataSource = signatureDelegate;
    [imClient openWithClientId:@“Tom” callback:^(BOOL succeeded, NSError *error){
        if (error) {
            // 出错了，可能是网络问题无法连接 LeanCloud 云端，请检查网络之后重试。
            // 此时聊天服务不可用。
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

其中四个属性分别是:

* signature 签名
* timestamp 时间戳，单位秒
* nonce 随机字符串 nonce
* error 签名错误信息