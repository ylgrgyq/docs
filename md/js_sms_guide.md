# JavaScript 短信验证码使用指南

如果你还没有设置你的项目，请查看我们的QuickStart。

如果你希望从项目中学习，请前往 [JavaScript SDK Demos](https://github.com/leancloud/leancloud-demos#javascript)。

## 简介

LeanCloud平台提供了一个移动App的完整后端解决方案,我们的目标是完全消除写
后端代码和维护服务器的必要性.

我们的 JavaScript SDK 基于流行的 Backbone.js 框架.它与已经存在的
Backbone程序是兼容的,只需要在你的代码中做出一点点改变,我们的最小化
配置,让你很快地用在LeanCloud上使用JavaScript和HTML5.

请在阅读本文档的同时，对照查看 [JavaScript API文档](./api/javascript/)。本指南并没有完全覆盖所有的 API 调用。

## 快速入门

建议您在阅读本文档之前，阅读我们提供的[快速入门](https://leancloud.cn/start.html)文档，获取 LeanCloud 使用的配置和第一印象。

### Apps

在LeanCloud上你可以为你的每一个移动应用创建一个App,每一个App都有它专属
的App id和App key.你在LeanCloud上的账户可以容纳多个App.对每一个应用你都
可以部署不同的版本到测试或生产环境.

### 依赖

我们的JavaScript SDK不需要引入其他的库,唯一的一个例外是AV.view
类,需要你提供jQuery或者一个jQuery兼容的$方法.

### 安全域名

如果在前端使用 JavaScript SDK，当你打算正式发布出去的时候，请务必配置「JavaScript SDK 安全域名」。配置方式：进入对应的 APP，然后选择「设置」——「基本信息」——「JavaScript SDK 安全域名」。

设置 JavaScript SDK 安全域名后，仅可在该域名下通过 JavaScript SDK 调用服务器资源，域名配置策略与浏览器域安全策略一致，要求域名协议、域和端口号都需严格一致，不支持子域和通配符。所以如果你要配置一个域名，要写清楚协议、域和端口，缺少一个都可能导致访问被禁止。域名的区别，如：

- www.a.com:8080 和 www.a.com     跨域
- www.a.com:8080 和 www.a.com:80  跨域
- a.com 和 www.a.com              跨域
- xxx.a.com 和 www.a.com          跨域
- http 和 https 不同协议            跨域

这样就可以防止其他人，通过外网其他地址盗用您的服务器资源。


## 短信验证服务

对于一些危险的操作，例如付费，删除数据等，你可能希望用户接收短信验证码并验证通过之后才允许进行，那么可以使用我们提供的短信验证服务。

首选需要在应用设置的应用选项里开启`启用手机号码短信认证 （针对 /1.1/verifySmsCode/:code 接口）`选项。

发送验证码通过：

```javascript
AV.Cloud.requestSmsCode('186xxxxxxxx').then(function(){
  //发送成功
}, function(err){
  //发送失败
});
```

你还可以定制发送的内容，设置下列选项：

* name 应用名称，默认是你的应用在 LeanCloud 显示的名称。
* op 进行的操作字符串，例如`付费`。
* ttl 以分钟为单位的过期时间。

```javascript
AV.Cloud.requestSmsCode({
  mobilePhoneNumber: '186xxxxxxxx',
  name: 'PP打车',
  op: '付费',
  ttl: 5
}).then(function(){
  //发送成功
}, function(err){
  //发送失败
});
```

如果您在应用设置里创建了短信模板，并且通过了管理员审核，那就可以发送模板短信，假设模板名称为 `test`，模板内容为

<pre ng-non-bindable ><code>
欢迎您使用 {{name}} 服务，我们将在 {{date}} 举办庆祝活动，欢迎参加。
</code></pre>

其中`name` 和 `date` 都是可替换的模板变量，那么可以通过下列方式来发送这条模板短信：

```javascript
AV.Cloud.requestSmsCode({
  mobilePhoneNumber: '186xxxxxxxx',
  template: "test"
  name: 'PP打车',
  date: '2014 年 10 月 22 号',
  ttl: 5
}).then(function(){
  //发送成功
}, function(err){
  //发送失败
});
```

`template` 指定模板名称，`mobilePhoneNumber` 是接收短信的手机号码，其他变量都将作为模板变量渲染。发送的短信内容将渲染为 `欢迎您使用 pp打车 服务，我们将在 2014 年 10 月 22 号 举办庆祝活动，欢迎参加。`。

在用户收到验证码并输入后，通过下列代码来验证是否正确：

```javascript
AV.Cloud.verifySmsCode('6位数字验证码', '11 位手机号码').then(function(){
  //验证成功
}, function(err){
  //验证失败
});
```

