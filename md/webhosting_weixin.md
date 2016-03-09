# 微信公众平台开发指南

随着微信逐渐开放的数据接口，开发者可以设置自定义的服务器地址，微信的服务端会把用户发送给公众号的消息转发到开发者自定义的服务器上，并且开发者可以调用接口进行回复，这就提供给了更多基于微信的场景进行二次开发的可能性。

LeanEngine日前把网站托管(Webhosting)作为一个单独的功能模块放了出来，Webhosting 作为 LeanEngine 的子集提供给开发者使用。

把微信和 LeanEngine 结合起来，就可以做一个几乎零成本的微信公众号自动问答机器人。

## 场景设定
本文档的主要是指导开发者使用 LeanEngine 作为微信公众号的回调服务器，因此我们设定了一个场景，我们根据场景设定的需求逐步演示实现的过程。

一个简单的场景如下就是实现一个自动根据用户发送消息做简单回复的机器人。比如用户发送：「你好」，我们的公众号机器人就会自动回复「您好，大家好才是真的好！」。


## 注册微信公众号
作为个人是可以微信公众号的，也就是所谓的自媒体的一种行为。

注册的网址是 [注册微信公众号](https://mp.weixin.qq.com/cgi-bin/readtemplate?t=register/step1_tmpl&lang=zh_CN)

注册的教程是 [微信公众平台注册步骤示例图（个人）](https://kf.qq.com/faq/120911VrYVrA130620u2iA7n.html)


## 微信控制台设置
登陆到后台，截图如下：
![weixin_web_management](http://ac-lhzo7z96.clouddn.com/1456389898408)

### 微信的开发选项
左下角找到菜单入口：

![menu_config](http://ac-lhzo7z96.clouddn.com/1456390574175)

## 创建项目
在 [LeanCloud 控制台](https://leancloud.cn/applist.html#/apps)中创建一个应用，暂且叫做「Wechat」
在一个文件夹（比如/usr/leancloud/wechat/）下执行下列命令行工具：

```bash
avoscloud new
```

然后你进入刚才创建的应用当中，点击[设置](https://leancloud.cn/app.html?appid={{appid}}#/general)，找到 App ID 以及 Master Key（这两个最好复制保存在文本中）

回到命令行工具，它会要求你输入 App ID 以及 Master Key，输入完成之后，可以看见在 `/usr/leancloud/wechat/` 下就创建了一个 LeanEngine 默认的模板项目，打开 `app.js` 文件，然后请打开如下 GitHub 上托管的完整的微信公众平台项目：[LeanEngine 微信自动问答机器人](https://github.com/leancloud/LeanEngine-WechatBot)，打开此项目下的 `app.js` 文件（建议克隆到本地）

## 配置项目
参照[app.js](https://github.com/leancloud/LeanEngine-WechatBot/blob/master/app.js) 的代码，建议直接复制拷贝所有内容，全部覆盖本地的(/usr/leancloud/wechat/app.js)里面的内容，然后找到关键的配置项修改。
此时需要打开微信公众号管理控制台，对应进行设置。

然后下图是我用来做实验的公众号的设置，描红的部分是我的配置：
![wexin_config](http://ac-lhzo7z96.clouddn.com/1456390412452)
```js
// 引用 wechat 库，详细请查看 https://github.com/node-webot/wechat
var wechat = require('wechat');
var config = {
  token: 'weixinDemo',
  appid: '请把微信的 AppID 填写在这里',
  encodingAESKey: '请把微信后台为您生成的 EncodingAESKey 填写在这里'
};
```

对应关系如下：

微信设置项 | 代码配置项
--- | ---
AppID(应用ID)|config.appid
Token(令牌) | config.token
EncodingAESKey(消息加密解密密钥)|  config.encodingAESKey

还有需要设置如下选项，把 `AppID(应用ID)` 和 `AppSercet(应用密钥)` 填入如下引号中，作为初始化参数：

```js
var WechatAPI = require('wechat-api');
var api = new WechatAPI('请把微信的 AppID 填写在这里',
  '请把微信的 Secret Key 填写在这里');
```

**微信的配置是实时验证的，假如你的服务器上并没有正确的进行验证，是无法配置成功的**
因此，我们先部署到 LeanEngine 中，才能在微信这边保存设置。

## 部署项目
回到[控制台的中 LeanEngine 设置界面](https://leancloud.cn/cloud.html?appid={{appid}}#/conf)，找到设置二级域名的地方：

![domain_setting](http://ac-lhzo7z96.clouddn.com/1456826436084)

设置域名为：wechatTest.leanapp.cn

然后回到项目目录下，执行如下命令行：

```bash
avoscloud deploy
``` 
这个是部署到预备环境，并没有真正发布到外网的线上，如果 `deploy` 成功之后，可以之下如下命令行：

```bash
avoscloud publish
```

## 配置验证
此时需要回到微信公众号的控制台，可以点击保存设置，此时，需要把刚才在 LeanEngine 上设置的域名填写在微信的控制台中(本例为：`wechatTest.leanapp.cn`)，验证一下。如果微信控制台提示验证失败，请仔细确认代码中的配置是否与控制台配置一致。

## 微信内验证
关注自己所注册的微信公众号，打开之后，发送「你好」，看看是否能成功按照代码执行回复指定的内容。
（正确的回复应该是：您好，大家好才是真的好！）







