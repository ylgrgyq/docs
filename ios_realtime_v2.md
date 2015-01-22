# iOS 实时通信服务(v2)

> 开始之前

> 在阅读本开发指南之前，请先阅读下[《实时通信开发指南（v2）》](./realtime_v2.html)，了解实时通信的基本概念和模型。


## 简介

LeanCloud 实时消息 iOS SDK（v2）提供了更简单的概念和模型，来尽可能降低理解、使用的门槛，并给予开发者最大的灵活度。

实时消息 SDK 基本的类型为：

* AVIMClient。用户在开始聊天之前，需要登录 LeanCloud 聊天服务器。每一个账户对应一个 AVIMClient。
* AVIMConversation。不管是单聊还是群聊，所有的消息交流都是从属于某一个对话的。用户登录之后，与人聊天之前，需要开启或者加入某一个对话。
* AVIMMessage。消息，代表用户发往对话的最基本信息。在 LeanCloud 实时消息服务中，所有的消息都是字符串，且最大长度不超过 5 KB。
* AVIMClientDelegate。AVIMClient 代理类，主要处理网络状态变化通知、新消息到达通知和对话成员变更通知。
* AVIMTypedMessage。AVIMMessage 派生类，LeanCloud 封装的富媒体消息类型，目前支持文本、图片、音频、视频、地理位置这 5 中消息，也允许开发者按照此框架扩展更多消息类型。

其交互模型为：

<pre>
AVIMClient   AVIMConversation   AVIMMessage  AVIMClientDelegate  LeanCloud云端
        ｜                                                             |
UserA:openWithClientId ----------------------------------------> auth/verify
        |
        | --create--> |
                      |----create---->|
                      |
                   sendMessage --------------------------------------->|
                                                                      
UserB:openWithClientId ----------------------------------------> auth/verify
                                                                       ｜
                                                    |<-onNewMessage -- ｜
        |
        | --join-->   |
                      |
                   showMessage

</pre>

**注意** 请首先确保你添加了如下依赖库

* SystemConfiguration.framework
* MobileCoreServices.framework
* CoreTelephony.framework
* CoreLocation.framework
* libicucore.dylib


## 用户登录


## 创建对话


## 发送最简单的文本消息


## 接收消息和通知，实现你的 AVIMClientDelegate


## 发送图片、视频、音频、地理位置等富媒体消息


## 获取历史消息


## 群组聊天
### 基本概念
### 创建或加入一个聊天室
### 邀请其他人加入聊天室
### 从聊天室踢出成员
### 往聊天室发消息
### 接收聊天室的消息

## 高级功能
### 实现签名（可选）
### 自定义消息类型（可选）
### 自定义消息推送内容