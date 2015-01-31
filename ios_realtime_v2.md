
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

首先我们需要在 application 的 onCreate 函数中进行 LeanCloud IM SDK 最基本的初始化：

```
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    // do other initialize...
    ...
    [AVOSCloud setApplicationId:@"yourAppID" clientKey:@"yourAppKey"];
    ...
}
```

接下来，我们需要完成用户（假定 Tom）登录：

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

    [imClient queryConversationsWithClientIds:@[@"Tom", @"Bob"]
                                   skip:0
                                  limit:1
                               callback:^(NSArray *objects, NSError *error){
                               if (objects && objects.count > 0) {
                                   // 已经有一个和 Bob 的对话存在，继续在这一对话中聊天
                                   _conversation = [objects objectAtIndex:0];
                                   ...
                               } else {
                                   // 不曾和 Bob 聊过，新建一个对话
                                   [imClient createConversationWithName:nil clientIds:@[@"Tom", @"Bob"] callback:^(AVIMConversation *conversation, NSError *error){
                                   if (error) {
                                       //
                                   } else {
                                       // 成功！
                                       _conversation = conversation;
                                       ...
                                   }
                                   }]
                               }
                               }];

第四步，我们往对话中发送一条消息：

    AVIMMessage *message = [AVIMMessage messageWithContent:@"hello"];
    [_conversation sendMessage:message callback:^(BOOL succeeded, NSError *error){
    if (error) {
        // failed.
    } else {
        // successful
    }
    }];

好了，这样一条消息就发送过去了。但是问题来了，对于「Bob」而言，他怎么才能收到别人发给他的消息呢？

### 消息接收

在 Bob 这一端，要能接收到消息，需要如下几步：

1，进行初始化和登录，代码与发送端并无二致；

2，实现 AVIMClientDelegate，响应新消息到达通知。主要是如下两个函数：

- (void)conversation:(AVIMConversation *)conversation didReceiveCommonMessage:(AVIMMessage *)message;
- (void)conversation:(AVIMConversation *)conversation invitedByClientId:(NSString *)clientId;

对于 Tom 发过来的消息，要显示出来，我们只需实现 conversation:didReceiveCommonMessage: 即可，示例代码如下：

```
-(void)conversation:(AVIMConversation *)conversation didReceiveCommonMessage:(AVIMMessage *)message {
    // 下面的逻辑会把消息直接存入本地数据库缓存。注意：你完全可以根据自己的需要来决定实际如何处理
    if (![_conversations containsObject:conversation]) {
        // 如果是一个新的对话，首先获取对话的信息，存入本地的缓存 _conversations
        [imClient queryConversationById:conversation.conversationId callback:^(AVIMConversation *conversation, NSError *error) {
            // 从服务器获取对话详细信息
            if (error) {
                // do something alert.
            } else {
                [self addConversationIfNotExists:conversation];
                [self saveMessageToDatabase:message callback:^(BOOL succeeded, NSError *error) {
                    [[NSNotificationCenter defaultCenter] postNotificationName:LC_NOTIFICATION_MESSAGE_UPDATED object:conversation];
                }];
            }
        }];
    } else {
        [self saveMessageToDatabase:message callback:^(BOOL succeeded, NSError *error) {
            [[NSNotificationCenter defaultCenter] postNotificationName:LC_NOTIFICATION_MESSAGE_UPDATED object:conversation];
        }];
    }
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

支持富媒体的聊天消息
-------------

开始的代码演示了如何发送文本信息，但是现在的交互方式已经越来越多样化，图片、语音、视频已是非常普遍的消息类型。v2 版的 LeanCloud IM SDK 已经可以很好地支持这些富媒体消息，具体说明如下：

### AVIMTypedMessage
所有富媒体消息的基类，其声明为

```
typedef int8_t AVIMMessageMediaType;
//SDK定义的消息类型，自定义类型使用大于0的值
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
+ (instancetype)messageWithText:(NSString *)text
                     attributes:(NSDictionary *)attributes;
```

### AVIMImageMessage
AVIMTypedMessage 子类，支持发送图片和附带文本的混合消息，其构造函数为：

```
+ (instancetype)messageWithText:(NSString *)text
               attachedFilePath:(NSString *)attachedFilePath
                     attributes:(NSDictionary *)attributes;
```

接收到这样消息之后，开发者可以获取到若干图片元数据（width，height，图片 size，图片 format）和一个包含图片数据的 AVFile 实例。

```
@property(nonatomic, readonly)uint width;
@property(nonatomic, readonly)uint height;
@property(nonatomic, readonly)uint64_t size;
@property(nonatomic, strong, readonly)NSString *format;
```

### AVIMAudioMessage
AVIMTypedMessage 子类，支持发送语音和附带文本的混合消息，其构造函数为：

```
+ (instancetype)messageWithText:(NSString *)text
               attachedFilePath:(NSString *)attachedFilePath
                     attributes:(NSDictionary *)attributes;
```

接收到这样消息之后，开发者可以获取到若干音频元数据（时长 duration、音频 size，音频 format）和一个包含图片数据的 AVFile 实例。

```
@property(nonatomic, readonly)uint64_t size;
@property(nonatomic, readonly)float duration;
@property(nonatomic, strong, readonly)NSString *format;
```

### AVIMVideoMessage
AVIMTypedMessage 子类，支持发送视频和附带文本的混合消息，其构造函数为：

```
+ (instancetype)messageWithText:(NSString *)text
               attachedFilePath:(NSString *)attachedFilePath
                     attributes:(NSDictionary *)attributes;
```

接收到这样消息之后，开发者可以获取到若干视频元数据（时长 duration、视频 size，视频 format）和一个包含图片数据的 AVFile 实例。

```
@property(nonatomic, readonly)uint64_t size;
@property(nonatomic, readonly)float duration;
@property(nonatomic, strong, readonly)NSString *format;
```

### AVIMLocationMessage
AVIMTypedMessage 子类，支持发送地理位置信息和附带文本的混合消息，其构造函数为：

```
+ (instancetype)messageWithText:(NSString *)text
                       latitude:(float)latitude
                      longitude:(float)longitude
                     attributes:(NSDictionary *)attributes;
```

接收到这样的消息之后，开发者可以获取到具体的地理位置数据：

```
@property(nonatomic, readonly)float latitude;
@property(nonatomic, readonly)float longitude;
```

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
        // innormal message.
    } else {
        AVIMMessageMediaType msgType = message.mediaType;
        switch(msgType) {
        case kAVIMMessageMediaTypeText:
            AVIMTextMessage *textMsg = (AVIMTextMessage*)message;
            // do something to textMsg.
            break;
        case kAVIMMessageMediaTypeImage:
            AVIMImageMessage *imageMsg = (AVIMImageMessage*)message;
            // do something to imageMsg.
            break;
        case kAVIMMessageMediaTypeAudio:
            AVIMAudioMessage *audioMsg = (AVIMAudioMessage*)message;
            // do something to audioMsg.
            break;
        case kAVIMMessageMediaTypeVideo:
            AVIMVideoMessage *videoMsg = (AVIMVideoMessage*)message;
            // do something to videoMsg.
            break;
        case kAVIMMessageMediaTypeLocation:
            AVIMLocationMessage *locationMsg = (AVIMLocationMessage*)message;
            // do something to locationMsg.
            break;
        default:
            break;
        }
    }
}
```

### 如何扩展自己的富媒体消息

blablablabla...


群组聊天
-------------

与前面的单聊类似，群组聊天也需要先建立一个对话（AVIMConversation），然后发送、接收新的消息。

### 创建群组 ###

和单聊类似，建立一个多人聊天的群组也是很简单的，我们可以调用一个 API，在建立群组的时候就加入成员并指定名字（注意名字是可选的）。例如：

```
[imClient createConversationWithName:@"anyGroupName"
                            clientIds:userIds
                           attributes:@{@"type":@2}
                             callback:^(AVIMConversation *conversation, NSError *error) {
    if (error) {
        // 创建失败，报错.
    } else {
        // 创建成功，userIds 已经被自动加入对话。
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
     
        操作者（管理员）                被邀请者                        其他人
    1, 发出请求 addMembers
    2,                     收到 invitedByClientId 通知
    3, 收到 membersAdded 通知                               收到 membersAdded 通知
   
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

### 获取历史消息 ###

LeanMessage 会将非暂态消息自动保存在云端，之后开发者可以通过 AVIMConversation 来获取该对话的所有历史消息。获取历史消息的 API 如下：

    NSString *oldestMsgId;
    int64_t oldestMsgTimestamp;
    [conversation queryHistoricalMessagesBeforeId:oldestMsgId
                              timestamp:oldestMsgTimestamp
                                  limit:20
                               callback:^(NSArray *objects, NSError *error){
                               if (error) {
                                   // failed
                               } else {
                                   // successful
                               }];

> 注意：
> 获取历史消息的时候，LeanCloud 云端是从某条消息开始，往前查找开发者指定的 N 条消息，返回给客户端。为此，获取历史消息需要传入三个参数：起始消息的 msgId，起始消息的发送时间戳，需要获取的消息条数。

通过这一 API 拿到的消息就是 AVIMMessage 或者 AVIMTypedMessage 实例数组，开发者可以像之前收到新消息通知一样处理。

### 搜索群组 ###

不管是单聊，还是群聊，在 LeanCloud IM SDK 里面都是对话（Conversation）。我们给对话设置了如下几种属性：

* conversationId，字符串，对话 id，只读，对话创建之后由 LeanCloud 云端赋予一个全局唯一的 id。
* creator，字符串，对话创建者 id，只读，标识对话创建者信息
* name，字符串，对话的名字，optional，可用来对于群组命名
* members，数组，对话参与者，这里记录了所有的参与者
* attributes，Map/Dict，自定义属性，供开发者自己扩展用。

所以我们也在 AVIMClient 中提供了几种搜索群组到方法：

```
/*!
 查询历史对话。
 @param name 名称包含name
 @param conditions key/value，表示attributes中key满足条件value，条件如下
                   value是字符串 -- key like value
                   value是数值或布尔值 -- key == value
 @param skip 跳过前面的结果数量
 @param limit 返回结果数量
 @param callback 查询结果回调
 @return None.
 */
- (void)queryConversationWithName:(NSString *)name
                    andConditions:(NSDictionary *)conditions
                             skip:(NSUInteger)skip
                            limit:(NSUInteger)limit
                         callback:(AVIMArrayResultBlock)callback;

/*!
 根据对话的参与者来查询对话
 @param clientIds 参与者id列表
 @param skip 跳过前面的结果数量
 @param limit 返回结果数量
 @param callback 查询结果回调
 @return None.
 */
- (void)queryConversationsWithClientIds:(NSArray *)clientIds
                                   skip:(NSUInteger)skip
                                  limit:(NSUInteger)limit
                               callback:(AVIMArrayResultBlock)callback;

/*!
 根据对话 id 查询对话。
 @param conversationId － 现有对话的 id
 @param callback 查询结果回调
 @return None.
 */
- (void)queryConversationById:(NSString*)conversationId callback:(AVIMConversationResultBlock)callback;

/*!
 根据对话 id 数组查询对话。
 @param conversationIds － 对话id数组
 @param callback 查询结果回调
 @return None.
 */
- (void)queryConversationByIds:(NSArray *)conversationIds callback:(AVIMArrayResultBlock)callback;
```

我们可以看看几种常见的群组查询如何实现：

- 有「我」参与的最近的对话。可以直接调用`[imClient queryConversationByIds:@[@"myClientId"] callback:callback]`来实现。
- 有「我」参与的群聊。与上一要求不一样的是，这里要区分「群聊」，而在 LeanCloud IM SDK 层面是不做这种限制的，一个对话究竟是单聊还是群聊，完全由应用自己决定。譬如应用在创建一个对话的时候，可以在自定义属性中增加一个 *{type:value}* 的属性值对，以 0 和 1 来代表单聊和群聊。那么这个需求就可以通过调用```[imClient queryConversationWithName:nil andConditions:@{@"type": 1} skip:0 limit:20 callback:callback]```来实现。
- 由「我」创建的所有对话。这里要根据创建者搜索对话，可以直接调用```[imClient xxx]```来实现。
- 应用内公开的群组。与第二个需求类似，应用层可以在自定义属性中增加一个是否公开的属性值对，然后根据这个属性来进行搜索，通过调用```[imClient queryConversationWithName:nil andConditions:@{@"type": 1} skip:0 limit:20 callback:callback]```来实现。
- 根据名字查找公开的群组。在上一需求的基础上，我们只需要指定名字片段，直接调用```[imClient queryConversationWithName:@"yourGroupName" andConditions:@{@"type": 1} skip:0 limit:20 callback:callback]```即可实现。
- 知道对话 id，直接查找某个对话。可以直接调用```[imClient queryConversationById:convId callback:callback]```来得到对话信息。

> 注意！
> 需求 2 和 3，我们目前的 API 还无法满足。

聊天记录和安全
-------------
为了满足开发者对权限和认证的要求，LeanMessage 还设计了操作签名的机制。我们可以在 LeanCloud 应用控制台、设置、应用选项中强制启用签名（强烈推荐这样做）。启用后，所有的用户登录、对话创建/加入、邀请成员、踢出成员等操作都需要验证签名，这样开发者就可以对消息功能进行充分的控制。

客户端这边究竟该如何使用呢？我们只需要实现自己的 SignatureFactory，然后在用户登录的时候，把这个 signatureFactory 传进去即可。示例代码如下：

```
```

设定了 SignatureFactory 之后，对于需要鉴权的操作，LeanMessage SDK 与服务器端通讯的时候都会带上应用自己生成的 Signature 信息，这样 LeanMessage 服务器端就会使用 app 的 masterKey 来验证信息的有效性，保证聊天渠道的安全。