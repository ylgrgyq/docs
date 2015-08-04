# 短信验证码使用指南

如果还没有安装 LeanCloud iOS SDK，请阅读 [快速入门](/start.html) 来获得该 SDK，并在 Xcode 中运行和熟悉示例代码。我们的 SDK 支持 iOS 4.3 及更高版本。

如果想从项目中学习短信验证码功能的使用方法，可参考 [LeanStorageDemo](https://github.com/leancloud/LeanStorage-Demo) 中的 [SMS](https://github.com/leancloud/LeanStorage-Demo/blob/master/LeanStorageDemo/AVSMSBasic.m) 模块。

## 介绍

LeanCloud 是一个完整的平台解决方案，它为应用开发提供了全方位的后端服务。我们的目标是让开发者不需要进行后端开发及服务器运维等工作，就可以开发和发布成熟的应用。

如果熟悉像 Ruby on Rails 这样的 Web 框架，你会发现 LeanCloud 很容易上手。我们在设计 LeanCloud 时应用了许多与之相同的原则。如果你之前使用过 Parse 或类似的后端服务，那么还会发现我们的 API 尽可能与其保持兼容。我们这样设计，是为了让开发者可以轻而易举地将应用从其他服务迁移至 LeanCloud，并且能得心应手地使用我们的 SDK 进行开发。

## 快速入门

建议在阅读本文之前，先阅读 [快速入门](/start.html)，了解如何配置和使用 LeanCloud。


<!--
## 使用 CocoaPods 安装 SDK

[快速入门](/start.html) 会教你如何在一个项目中安装 SDK。

[CocoaPods](http://www.cocoapods.org/) 是一款很好的依赖管理工具，其安装步骤大致如下：

* 首先确保开发环境中已经安装了 Ruby（一般安装了 XCode，Ruby 会被自动安装上）
* 我们建议使用淘宝提供的 [Gem源](http://ruby.taobao.org/)，在终端执行下列命令：

  ```sh
  $ gem sources --remove https://rubygems.org/
  $ gem sources -a http://ruby.taobao.org/
  # 请确保下列命令的输出只有 ruby.taobao.org
  $ gem sources -l
  *** CURRENT SOURCES ***
  http://ruby.taobao.org
  ```

* 通过下列命令，安装（或更新）CocoaPods（可能需要输入登录密码）：

  ```sh
  sudo gem install cocoapods
  ```

* 在项目根目录下创建一个名为 `Podfile` 的文件（无扩展名），并添加以下内容：

  ```sh
  pod 'AVOSCloud'
  ```
* 如果使用 SNS 组件（社交平台服务）的相关功能，则添加：

  ```sh
  pod 'AVOSCloudSNS'
  ```

* 执行命令 `pod install` 安装 SDK。

相关资料：《[CocoaPods 安装和使用教程](http://code4app.com/article/cocoapods-install-usage)》
-->

## 应用

部署在 LeanCloud 上的每个应用都有自己的 ID 和客户端密钥，客户端代码应该使用它们来初始化 SDK。

LeanCloud 的每一个账户都可以创建多个应用。同一个应用可分别在测试环境和生产环境部署不同的版本。

## 短信验证码服务

除了与用户相关的注册、登录等操作以外，LeanCloud 还支持额外的短信验证码服务。

在实际应用中，有些类型的操作对安全性比较敏感，比如付费、删除重要资源等等。若想通过短信验证的方式来与用户进行确认，就可以在以下前提下，使用 LeanCloud 提供的短信验证码服务：

* 用户已验证过手机号码。
* 应用管理平台打开了 **启用账号无关短信验证服务（针对 `requestSmsCode` 和 `verifySmsCode` 接口）** 选项。

### 请求短信验证码

为某个操作发送验证短信：

```objc
    [AVOSCloud requestSmsCodeWithPhoneNumber:@"13613613613"
                                     appName:@"某应用"
                                   operation:@"具体操作名称"
                                  timeToLive:10
                                    callback:^(BOOL succeeded, NSError *error) {
        // 执行结果
    }];
   //短信格式类似于：
   //您正在{某应用}中进行{具体操作名称}，您的验证码是:{123456}，请输入完整验证，有效期为:{10}分钟

```

### 自定义短信模板

若想完全自定义短信的内容，可在应用管理平台中，通过 **短信模板** 来创建自定义的短信模板，但是需要**审核**。

短信模板提交并审核后，即可使用 SDK 向用户发送符合短信模板定义的短信内容。

比如，提交如下短信模板，模板名称为 `Register_Template`：

<pre ng-non-bindable ><code>
Hi {{username}},
欢迎注册{{name}}应用，你可以通过验证码:{{code}}，进行注册。本条短信将在{{ttl}}分钟后自行销毁。请尽快使用。
以上。
{{appname}}
</code></pre>

**注：`name`、 `code`、 `ttl`  是预留的字段，分别代表应用名、验证码、过期时间。系统会自动为它们填充内容。**

发送短信：

```objc
    NSMutableDictionary *dict = [[NSMutableDictionary alloc] init];
    [dict setObject:@"MyName" forKey:@"username"];
    [dict setObject:@"MyApplication" forKey:@"appname"];
    [AVOSCloud requestSmsCodeWithPhoneNumber:@"12312312312" templateName:@"Register_Template" variables:dict callback:^(BOOL succeeded, NSError *error) {
        if (succeeded) {
            //操作成功
        } else {
            NSLog(@"%@", error);
        }
    }];
```

### 短信签名说明

短信签名是指短信内容里 `【】` 括起来的短信发送方名称，如果没有明确在模板里指定，默认就是你的应用名称。**短信签名不能超过 10 个字符，应用名称可以在应用设置里修改，并且短信签名必须出现在短信内容的开头或者结尾。**

### 验证短信验证码

验证短信验证码：

```objc
    [AVOSCloud verifySmsCode:@"123456" mobilePhoneNumber:@"13613613613" callback:^(BOOL succeeded, NSError *error) {
        //code
    }];
```








