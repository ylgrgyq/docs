{% extends "./sdk_setup.tmpl" %}

{% block language %}JavaScript{% endblock %} 

{% block libs_tool_automatic %}

#### npm 安装

LeanCloud JavaScript SDK 也可在 Nodejs 等服务器端环境运行，可以使用 LeanEngine 来搭建服务器端，可以参考[相关文档](https://leancloud.cn/docs/leanengine_guide-node.html)。

```
// 存储服务
$ npm install avoscloud-sdk
// 实时消息服务
$ npm install leancloud-realtime
```
如果因为网络原因，无法通过官方的 npm 站点下载，推荐可以通过 [CNPM](https://cnpmjs.org/) 来下载，操作步骤如下：

首先执行命令：

```
$ npm install -g cnpm --registry=http://r.cnpmjs.org
```
让本地安装 cnpm 工具。

然后执行：

```
// 存储服务
$ cnpm install -g avoscloud-sdk 
// 实时消息服务
$ cnpm install leancloud-realtime
```

#### bower 安装

也支持 bower 安装

```
$ bower install leancloud-javascript-sdk
```

#### CDN 加速

```
<script src="https://cdn1.lncld.net/static/js/av-mini-{版本号}.js"></script>
// 或者你只是用最核心的存储、推送等功能，可以使用精简版的core.js
<script src="https://cdn1.lncld.net/static/js/av-core-mini-{版本号}.js"></script>
```

#### Web 安全

如果在前端使用 JavaScript SDK，当你打算正式发布的时候，请务必配置 `Web 安全域名`。配置方式：进入对应的 app，然后选择 `设置`——`安全中心`——`Web 安全域名`。这样就可以防止其他人，通过外网其他地址盗用你的服务器资源。

具体安全相关内容可以仔细阅读文档 [数据和安全](data_security.html) 。
{% endblock %}

{% block sdk_download_link %}[SDK下载](sdk_down.html){% endblock %}

{% block import_sdk %}

LeanCloud JavaScript SDK 是分模块使用的，可根据下列表格对应选择所需要的模块：

```
├── av-core-mini.js      // LeanCloud 核心框架（压缩版，建议用于生产环境）
├── av-core.js           // LeanCloud 核心框架（未压缩版）
├── av-mini.js           // LeanCloud 接口框架（压缩版）
├── av.js                // LeanCloud 接口框架（未压缩版）
├── AV.push.min.js       // LeanCloud 推送模块（压缩版）
├── AV.push.js           // LeanCloud 推送模板（未压缩版）
├── AV.realtime.min.js   // LeanCloud 实时消息模块（压缩版）
└── AV.realtime.js       // LeanCloud 实时消息模块（未压缩版）
```
**使用存储服务的时候，`av.js(min)` 和 `av-core.js(min)`  必须一起引用。**

聊天和推送各自可以独立引用。

{% endblock %}

{% block init_with_app_keys %}
如果是在前端项目里面使用 LeanCloud JavaScript SDK，那么可以在页面加载的时候调用一下初始化的函数：

```
AV.initialize('NdfnuwEOgDswF9Lic86vFehT', 'XuxMjOgq5L2dN3dtCwhej7oC');
```



{% endblock %}

{% block save_a_hello_world %}

```
var TestObject = AV.Object.extend('TestObject');
var testObject = new TestObject();
testObject.save({
  words: 'Hello,World!'
}, {
  success: function(object) {
    alert('LeanCloud works!');
  }
});
```
{% endblock %}