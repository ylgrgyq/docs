{# 指定继承模板 #}
{% extends "./leanengine_webhosting_guide.tmpl" %}

{% set productName = 'LeanEngine' %}
{% set platformName = 'Node.js' %}
{% set sdk_name = 'JavaScript' %}


{% block link_to_other_languages %}
#### Python
如果您是 Python 开发者请查阅 [云引擎开发指南-Python](leanengine_guide_v2-python.html)

#### PHP
如果您是 PHP 开发者请查阅 [云引擎开发指南-PHP](leanengine_guide_v2-php.html)
{% endblock %}

{% block demo %}
* [node-js-getting-started](https://github.com/leancloud/node-js-getting-started)：这是一个非常简单的基于 Express 4 的项目，可以作为大家的项目模板。（在线演示：<http://node.leanapp.cn/>） 
* [leanengine-todo-demo](https://github.com/leancloud/leanengine-todo-demo)：这是一个稍微复杂点的项目，是上一个项目的扩展，演示了基本的用户注册、会话管理、业务数据的增删查改、简单的 ACL 使用。这个项目可以作为初学云引擎和 [JavaScript SDK](js_guide.html) 使用。（在线演示：<http://todo-demo.leanapp.cn/>）
* [LeanEngine-Full-Stack](https://github.com/leancloud/LeanEngine-Full-Stack) ：该项目是基于云引擎的 Web 全栈开发的技术解决方案，比较大型的 Web 项目可以使用这个结构实现从 0 到 1 的敏捷开发。
{% endblock %}


{% block default_project_construction %}
```
.
├── app.js            
├── cloud.js 
├── package.json
├── public
    ├── stylesheets
        ├── style.css
├── README.md    
├── routes
    ├── todo.js
├── server.js      
├── views
    ├── error.ejs
    ├── index.ejs
    └── todos.ejs

```
{% endblock %}

{% block based_on_project_template %}
从 Github 迁出实例项目，该项目可以作为一个你应用的基础：

```
$ git clone https://github.com/leancloud/node-js-getting-started.git
$ cd node-js-getting-started
```

然后添加应用 appId 等信息到该项目：

```
$ avoscloud add <appName> <appId>
```
{% endblock %}

{% block run_in_local_command %}
首先在当前项目的目录下安装必要的依赖，执行如下命令行：

```
$ npm install
```

然后启动应用：

```
$ avoscloud
```
{% endblock %}

{% block annotation_cloud_function_online_debug %}
访问页面实际上就是在访问代码 `./app.js` 中的 默认路由：

```js
app.get('/', function(req, res) {
  res.render('index', { currentTime: new Date() });
});
```
对照代码，查看页面显示的内容是否与代码一致。
{% endblock %}

{% block custom_api_random_string %}
打开 `./app.js` ，添加如下代码：

```js
app.get('/time', function(req, res) {
  res.send({ currentTime: new Date() });
});
```

然后打开浏览器，访问<http://localhost:3000/time>，浏览器应该会返回如下类似的内容：

```json
{"currentTime":"2016-02-01T09:43:26.223Z"}
```
{% endblock %}

{% block use_leanstorage %}
{{productName}} 在 Node.js 的运行时中自动包含了 LeanCloud JavaScript SDK ，因此开发者可以很方便地直接使用 LeanStorage 作为自己的后端数据存储服务，相关文档请查阅：[LeanCloud JavaScript SDK](js_guide.html)
{% endblock %}

{% block supported_frameworks %}
{{productName}} 支持原生的 [Node.js](https://nodejs.org/) 和 [Express 4.0](http://expressjs.com/) 构建的应用。
{% endblock %}

{% block code_get_client_ip_address %}
```js
app.get('/', function(req, res) {
  console.log(req.headers['x-real-ip']);// 打印 IP 地址
  res.render('index', { currentTime: new Date() });
});
```
{% endblock %}

{% block upload_file_special_middleware %}
然后配置应用使用 [multiparty](https://www.npmjs.com/package/multiparty) 中间件：

```javascript
var multiparty = require('multiparty');
```
{% endblock %}

{% block code_upload_file_sdk_function %}
```javascript
var fs = require('fs');
app.post('/upload', function(req, res){
  var form = new multiparty.Form();
  form.parse(req, function(err, fields, files) {
    var iconFile = files.iconImage[0];
    if(iconFile.size !== 0){
      fs.readFile(iconFile.path, function(err, data){
        if(err) {
          return res.send('读取文件失败');
        }
        var base64Data = data.toString('base64');
        var theFile = new AV.File(iconFile.originalFilename, {base64: base64Data});
        theFile.save().then(function(theFile){
          res.send('上传成功！');
        });
      });
    } else {
      res.send('请选择一个文件。');
    }
  });
});
```
{% endblock %}

{% block cookie_session %}
### 处理用户登录和登出

要让云引擎支持 LeanCloud 用户体系的 Session，在 app.js 里添加下列代码：

```javascript
var express = require('express');
var AV = require('leanengine');

var app = express();
// 加载 cookieSession 以支持 AV.User 的会话状态
app.use(AV.Cloud.CookieSession({ secret: 'my secret', maxAge: 3600000, fetchUser: true }));
```

使用 `AV.Cloud.CookieSession` 中间件启用 CookieSession，注意传入一个 secret 用于 cookie 加密（必须）。它会自动将 AV.User 的登录信息记录到 cookie 里，用户每次访问会自动检查用户是否已经登录，如果已经登录，可以通过 `req.AV.user` 获取当前登录用户。

`AV.Cloud.CookieSession` 支持的选项包括：

* **fetchUser**：**是否自动 fetch 当前登录的 AV.User 对象。默认为 false。**  
  如果设置为 true，每个 HTTP 请求都将发起一次 LeanCloud API 调用来 fetch 用户对象。如果设置为 false，默认只可以访问 `req.AV.user` 当前用户的 id 属性（即 _User 表记录的 ObjectId），你可以在必要的时候 fetch 整个用户。通常保持默认的 false 就可以。
* **name**：session 在 cookie 中存储的 key 名称，默认为 `avos.sess`。
* **maxAge**：设置 cookie 的过期时间。

`httpOnly` 和 `signed` 参数我们强制设置为 true。

**注意**：我们通常不建议在云引擎环境中通过 `AV.User.current()` 获取登录用户的信息，虽然这样做不会有问题，也不会有串号的风险，但由于这个功能依赖 Node.js 的 Domain 模块，而 Node.js 4.x 已经不推荐使用 Domain 模块了，所以在云引擎中获取 currentUser 的机制后续会发生改变。因此，我们建议：

* 在云引擎方法中，通过 request.user 获取用户信息。
* 在 webHosting 中，通过 req.AV.user 获取用户信息。
* 在后续的方法调用显示传递 user 对象。

登录很简单：

```javascript
app.get('/login', function(req, res) {
  // 渲染登录页面
  res.render('login.ejs');
});
// 点击登录页面的提交将出发下列函数
app.post('/login', function(req, res) {
  AV.User.logIn(req.body.username, req.body.password).then(function(user) {
    //登录成功，AV.Cloud.CookieSession 会自动将登录用户信息存储到 cookie
    //跳转到profile页面。
    console.log('signin successfully: %j', user);
    res.redirect('/profile');
  },function(error) {
    //登录失败，跳转到登录页面
    res.redirect('/login');
  });
});
//查看用户profile信息
app.get('/profile', function(req, res) {
  // 判断用户是否已经登录
  if (req.AV.user) {
    // 如果已经登录，发送当前登录用户信息。
    res.send(req.AV.user);
  } else {
    // 没有登录，跳转到登录页面。
    res.redirect('/login');
  }
});

//调用此url来登出帐号
app.get('/logout', function(req, res) {
  // AV.Cloud.CookieSession 将自动清除登录 cookie 信息
  AV.User.logOut();
  res.redirect('/profile');
});
```

登录页面大概是这样 login.ejs:

```html
<html>
    <head></head>
    <body>
      <form method="post" action="/login">
        <label>Username</label>
        <input name="username"></input>
        <label>Password</label>
        <input name="password" type="password"></input>
        <input class="button" type="submit" value="登录">
      </form>
    </body>
  </html>
```

注意：express 框架的 `express.session.MemoryStore` 在我们云引擎中是无法正常工作的，因为我们的云引擎是多主机，多进程运行，因此内存型 session 是无法共享的，建议用 [express.js &middot; cookie-session 中间件](https://github.com/expressjs/cookie-session)。
{% endblock %}

{% block custom_session %}
### 自定义 session
有时候你需要将一些自己需要的属性保存在 session 中，你可以增加通用的 `cookie-session` 组件，详情可以参考 [express.js &middot; cookie-session](https://github.com/expressjs/cookie-session)。该组件和 `AV.Cloud.CookieSession` 组件可以并存。
{% endblock %}

{% block https_redirect %}
```javascript
app.enable('trust proxy');
app.use(AV.Cloud.HttpsRedirect());
```
{% endblock %}
