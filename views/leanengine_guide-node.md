{% extends "./leanengine_guide.tmpl" %}

{% block quick_start_create_project %}
从 Github 迁出实例项目，该项目可以作为一个你应用的基础：

```
$ git clone git@github.com:leancloud/node-js-getting-started.git
$ cd node-js-getting-started
```

然后添加应用 appId 等信息到该项目：

```
$ avoscloud app <appName> <appId>
```
{% endblock %}

{% block updateToLeanEngine%}
### 升级到 LeanEngine
云代码 2.0 和 LeanEngine 的差别主要是应用的目录结构：因为 LeanEngine 没有沙箱环境，所以不强制 `cloud` 和 `config` 等目录结构，只要是一个普通的 Node.js 项目即可。而 SDK 将作为一个普通组件添加到项目中，所以使用方面也有一些变化：

* 需要自己初始化 AV 对象：云代码 2.0 的环境会直接将 AV 对象初始化并保存在沙箱环境上下文中，所以不需要任何声明而直接使用。我们认为这样略微违反知觉，所以 LeanEngine 环境需要自行初始化 AV 对象，而且可以根据需要来决定此过程是否使用 masterKey 。
* 时区：云代码 2.0 默认使用 UTC 时区，这给很多开发者带来了困惑。所以 LeanEngine 默认情况使用东八区时区，在 [时区问题](#时区问题) 部分详细讨论这个问题。
* `avos-express-cookie-session` 的改变：该组件不再依赖 `cookie-parse`，而且引入方式发生变化，详情见 [处理用户登录和登出](#处理用户登录和登出)。
* 运行环境判断：云代码 2.0 使用 `__production` 全局变量判断当前环境是「测试环境」还是「生产环境」，而 LeanEngine 尊重 Node.js 的习惯，使用 `NODE_ENV` 这个变量来进行区分，`test` 为测试环境，`production` 为生产环境。详情见 [运行环境区分](#运行环境区分)
{% endblock %}

{% block runtime_env %}**注意**： 目前 LeanEngine 的 Node.js 版本为 0.12，请你最好使用此版本进行开发，至少不要低于 0.10 。{% endblock%}

{% block run_in_local_command %}
```
$ avoscloud
```
{% endblock %}

{% block cloud_func_file %}`$PROJECT_DIR/cloud.js`{% endblock %}

{% block project_constraint %}
LeanEngine Node.js 项目必须有 `$PROJECT_DIR/server.js` 文件，该文件为整个项目的启动文件。
{% endblock %}

{% block others_web_framework %}
LeanEngine 支持任意 node.js 的 web 框架，你可以使用你最熟悉的框架进行开发，或者不使用任何框架，直接使用 node.js 的 http 模块进行开发。但是请保证通过执行 `server.js` 能够启动你的项目，启动之后程序监听的端口为 `process.env.LC_APP_PORT`。
{% endblock %}

{% block install_middleware %}
在 Node.js 环境，使用 [leanengine-sdk](https://github.com/leancloud/leanengine-node-sdk) 来代替 [javascript-sdk](https://github.com/leancloud/javascript-sdk) 组件。前者扩展了后者，增加了云代码方法和 hook 的支持。在项目根目录下，执行：

```
$ npm install leanengine-sdk --save
```

来安装 leanengine-sdk，之后你就可以在项目中使用了。
{% endblock %}

{% block init_middleware %}
```js
var AV = require('leanengine-sdk');

var APP_ID = process.env.LC_APP_ID || 'your_app_id';
var APP_KEY = process.env.LC_APP_KEY || 'your_app_key';
var MASTER_KEY = process.env.LC_APP_MASTER_KEY || 'your_master_key';

AV.initialize(APP_ID, APP_KEY, MASTER_KEY);
```
{% endblock %}

{% block sdk_guide_link %}[JavaScript SDK](./js_guide.html){% endblock %}

{% block cloudFuncExample %}
```javascript
AV.Cloud.define('averageStars', function(request, response) {
  var query = new AV.Query('Review');
  query.equalTo('movie', request.params.movie);
  query.find({
    success: function(results) {
      var sum = 0;
      for (var i = 0; i < results.length; ++i) {
        sum += results[i].get('stars');
      }
      response.success(sum / results.length);
    },
    error: function() {
      response.error('movie lookup failed');
    }
  });
});
```
{% endblock %}

{% block cloudFuncParams %}
有两个参数会被传入到Cloud函数：

* request - 包装了请求信息的请求对象，下列这些字段将被设置到request对象内:
 * params - 客户端发送的参数对象
 * user - `AV.User` 对象，发起调用的用户，如果没有登录，则不会设置此对象。如果通过 REST API 调用时模拟用户登录，需要增加一个头信息 `X-AVOSCloud-Session-Token: <sessionToken>`，该 `sessionToken` 在用户登录或注册时服务端会返回。
* response - 应答对象，包含两个函数：
 * success - 这个函数可以接收一个额外的参数，表示返回给客户端的结果数据。这个参数对象可以是任意的JSON对象或数组，并且可以包含`AV.Object`对象。
 * error - 如果这个方法被调用，则表示发生了一个错误。它也接收一个额外的参数来传递给客户端，提供有意义的错误信息。
{% endblock %}

{% block runFuncName %}`AV.Cloud.run`{% endblock %}

{% block defineFuncName %}`AV.Cloud.define`{% endblock %}

{% block runFuncExample %}
```javascript
AV.Cloud.run('hello', {name: 'dennis'}, {
  success: function(data){
      //调用成功，得到成功的应答data
  },
  error: function(err){
      //处理调用失败
  }
});
```
{% endblock %}

{% block runFuncApiLink %}[AV.Cloud.run](https://leancloud.cn/docs/api/javascript/symbols/AV.Cloud.html#.run){% endblock %}

{% block beforeSaveExample %}
```javascript
AV.Cloud.beforeSave('Review', function(request, response) {
  var comment = request.object.get('comment');
  if (comment) {
    if (comment.length > 140) {
      // 截断并添加...
      request.object.set('comment', comment.substring(0, 137) + '...');
    }
    // 保存到数据库中
    response.success();
  } else {
    // 不保存数据，并返回错误
    response.error('No comment!');    
  }
});
```
{% endblock %}

{% block afterSaveExample %}
```javascript
AV.Cloud.afterSave('Comment', function(request) {
  query = new AV.Query('Post');
  query.get(request.object.get('post').id, {
    success: function(post) {
      post.increment('comments');
      post.save();
    },
    error: function(error) {
      throw 'Got an error ' + error.code + ' : ' + error.message;
    }
  });
});
```
{% endblock %}

{% block afterSaveExample2 %}
```javascript
AV.Cloud.afterSave('_User', function(request) {
  console.log(request.object);
  request.object.set('from','LeanCloud');
  request.object.save(null,{success:function(user)
    {
      console.log('ok!');
    },error:function(user,error)
    {
      console.log('error',error);
    }
    });
});
```
{% endblock %}

{% block afterUpdateExample %}
```javascript
AV.Cloud.afterUpdate('Article', function(request) {
   console.log('Updated article,the id is :' + request.object.id);
});
```
{% endblock %}

{% block beforeDeleteExample %}
```javascript
AV.Cloud.beforeDelete('Album', function(request, response) {
  //查询Photo中还有没有属于这个相册的照片
  query = new AV.Query('Photo');
  var album = AV.Object.createWithoutData('Album', request.object.id);
  query.equalTo('album', album);
  query.count({
    success: function(count) {
      if (count > 0) {
        //还有照片，不能删除，调用error方法
        response.error('Can\'t delete album if it still has photos.');
      } else {
        //没有照片，可以删除，调用success方法
        response.success();
      }
    },
    error: function(error) {
      response.error('Error ' + error.code + ' : ' + error.message + ' when getting photo count.');
    }
  });
});
```
{% endblock %}

{% block afterDeleteExample %}
```javascript
AV.Cloud.afterDelete('Album', function(request) {
  query = new AV.Query('Photo');
  var album = AV.Object.createWithoutData('Album', request.object.id);
  query.equalTo('album', album);
  query.find({
    success: function(posts) {
    //查询本相册的照片，遍历删除
    AV.Object.destroyAll(posts);
    },
    error: function(error) {
      console.error('Error finding related comments ' + error.code + ': ' + error.message);
    }
  });
});
```
{% endblock %}

{% block onVerifiedExample %}
```javascript
AV.Cloud.onVerified('sms', function(request, response) {
    console.log('onVerified: sms, user: ' + request.object);
    response.success();
```
{% endblock %}

{% block onLoginExample %}
```javascript
AV.Cloud.onLogin(function(request, response) {
  // 因为此时用户还没有登录，所以用户信息是保存在 request.object 对象中
  console.log("on login:", request.object);
  if (request.object.get('username') == 'noLogin') {
    // 如果是 error 回调，则用户无法登录（收到 401 响应）
    response.error('Forbidden');
  } else {
    // 如果是 success 回调，则用户可以登录
    response.success();
  }
});
```
{% endblock %}

{% block errorCodeExample %}

有些时候你希望能自己定义错误响应码。云代码方法最终的错误对象如果有 `code` 和 `message` 属性，则响应的 `body` 以这两个属性为准，否则 `code` 为 `1`， `message` 为错误对象的字符串形式。比如下列代码：

```
AV.Cloud.define('errorCode', function(req, res) {
  AV.User.logIn('NoThisUser', 'lalala', {
    error: function(user, err) {
      res.error(err);
    }
  });
});
```
{% endblock %}

{% block errorCodeExample2 %}
```
AV.Cloud.define('customErrorCode', function(req, res) {
  res.error({code: 123, message: 'custom error message'});
});
```
{% endblock %}

{% block timerExample %}
```javascript
AV.Cloud.define('log_timer', function(req, res){
    console.log('Log in timer.');
    return res.success();
});
```
{% endblock %}

{% block timerExample2 %}
```javascript
AV.Cloud.define('push_timer', function(req, res){
  AV.Push.send({
        channels: [ 'Public' ],
        data: {
            alert: 'Public message'
        }
    });
   return res.success();
});
```
{% endblock %}

{% block masterKeyInit %}
```javascript
AV.initialize('app id', 'app key', 'master key');
AV.Cloud.useMasterKey();
```
{% endblock %}

{% block loggerExample %}
```javascript
AV.Cloud.define('Logger', function(request, response) {
  console.log(request.params);
  response.success();
});
```
{% endblock %}

{% block static_cache %}
默认静态资源的`Cache-Control`是`max-age=0`，这样在每次请求静态资源的时候都会去服务端查询是否更新，如果没有更新返回304状态码。你还可以在`app.listen`的时候传入选项，设置静态资源的maxAge：

```javascript
//设置7天不过期
app.listen({'static': {maxAge: 604800000}});
```

请注意`maxAge`的单位是毫秒，这样cache-control头会变成`max-age=604800`。更多static选项参考[static middleware](http://www.senchalabs.org/connect/static.html)。
{% endblock %}

{% block dynamic_request %}
这是通过编写 [Node.js](http://nodejs.org) 代码，基于[express.js](http://expressjs.com/)这个web MVC框架做到的。

关于[express.js](http://expressjs.com/)框架，请参考官方文档来学习。

在项目实例 `$PROJECT_DIR/app.js`，我们可以看到一个初始代码：

```javascript
var express = require('express');
var app = express();

// App全局配置
app.set('views', path.join(__dirname, 'views'));     // 设置模板目录
app.set('view engine', 'ejs');                       // 设置template引擎
app.use(bodyParser.json());                          // 读取请求body的中间件
app.use(bodyParser.urlencoded({ extended: false }));

//使用express路由API服务/hello的http GET请求
app.get('/hello', function(req, res) {
  res.render('hello', { message: 'Congrats, you just set up your app!' });
});

// 端口一定要从环境变量 `LC_APP_PORT` 中获取。
// LeanEngine 运行时会分配端口并赋值到该变量。
var PORT = parseInt(process.env.LC_APP_PORT || 3000);
var server = app.listen(PORT, function () {
  console.log('Node app is running, port:', PORT);
});
```

我们使用`ejs`模板来渲染view，默认的模板都放在`views`目录下，比如这里`hello.ejs`:

```html
<%= message %>
```

简单地显示message内容。你还可以选用[jade](https://github.com/visionmedia/jade)这个模板引擎：

```javascript
app.set('view engine', 'jade');
```

您可以参照上面的 [部署](#部署) 文档来部署这个代码，部署成功之后，直接可以访问 `http://${your_app_domain}.avosapps.com/hello` 将看到展示的 message:

```
Congrats, you just set up your app!
```

更多复杂的路由和参数传递，请看 [express.js框架文档](http://expressjs.com/guide.html)。

我们还提供了一个在线demo：[http://node-runtime.avosapps.com/](http://node-runtime.avosapps.com/)，源码在 [https://github.com/leancloud/node-js-getting-started](https://github.com/leancloud/node-js-getting-started)，您可以作为参考。
{% endblock %}

{% block error_page_404 %}
假设我们要渲染一个404页面，必须将下列代码放在所有 middleware 之后：

```javascript
// 在所有 middleware 之后。
app.use(function(req, res, next){
  res.status(404).render('404', {title: 'Sorry, page not found'});
});
```

这将渲染views下面的404模板页面。
{% endblock %}

{% block get_client_ip %}
```javascript
var ip = req.headers['x-real-ip']
```
{% endblock %}

{% block upload_file %}
在 LeanEngine 里上传文件也很容易，首先配置app使用bodyParser中间件，它会将上传表单里的文件存放到临时目录并构造一个文件对象放到request.files里：

```javascript
app.use(express.bodyParser());
```

使用表单上传文件，假设文件字段名叫iconImage:

```html
<form enctype="multipart/form-data" method="post" action="/upload">
  <input type="file" name="iconImage">
  <input type="submit" name="submit" value="submit">
</form>
```

上传文件使用multipart表单，并POST提交到/upload路径下。

接下来定义文件上传的处理函数，使用受到严格限制并且只能读取上传文件的`fs`模块：

```javascript
var fs = require('fs');
app.post('/upload', function(req, res){
  var iconFile = req.files.iconImage;
  if(iconFile){
    fs.readFile(iconFile.path, function(err, data){
      if(err)
        return res.send('读取文件失败');
      var base64Data = data.toString('base64');
      var theFile = new AV.File(iconFile.name, {base64: base64Data});
      theFile.save().then(function(theFile){
        res.send('上传成功！');
      });
    });
  }else
    res.send('请选择一个文件。');
});
```
{% endblock %}

{% block cookie_session %}
要让 LeanEngine 支持 LeanCloud 用户体系的 Session，在 app.js 里添加下列代码：

```javascript
var express = require('express');
var AV = require('leanengine-sdk');

var app = express();
// 加载 cookieSession 以支持 AV.User 的会话状态
app.use(AV.Cloud.CookieSession({ secret: 'my secret', maxAge: 3600000, fetchUser: true }));
```

使用 `AV.Cloud.CookieSession` 中间件启用 CookieSession，注意传入一个 secret 用于 cookie 加密（必须）。它会自动将AV.User的登录信息记录到 cookie 里，用户每次访问会自动检查用户是否已经登录，如果已经登录，可以通过 `req.AV.user` 获取当前登录用户。

`AV.Cloud.CookieSession` 支持的选项包括：

* fetchUser -- **是否自动fetch当前登录的AV.User对象。默认为false。**如果设置为true，每个HTTP请求都将发起一次LeanCloud API调用来fetch用户对象。如果设置为false，默认只可以访问 `req.AV.user` 当前用户的id属性，您可以在必要的时候fetch整个用户。通常保持默认的false就可以。
* name -- session在cookie中存储的key名称，默认为 `avos.sess`。
* maxAge -- 设置cookie的过期时间。

`httpOnly` 和 `signed` 参数我们强制设置为 true。

**注意**：我们通常不建议在云代码环境中通过 `AV.User.current()` 获取登录用户的信息，虽然这样做不会有问题，也不会有串号的风险，但是我们仍建议:

* 在云代码方法中，通过 request.user 获取用户信息。
* 在 webHosting 中，通过 req.AV.user 获取用户信息。
* 在后续的方法调用显示的传递 user 对象。

登录很简单：

```javascript
app.get('/login', function(req, res) {
  // 渲染登录页面
  res.render('login.ejs');
});
// 点击登录页面的提交将出发下列函数
app.post('/login', function(req, res) {
  AV.User.logIn(req.body.username, req.body.password).then(function() {
    //登录成功，AV.Cloud.CookieSession 会自动将登录用户信息存储到 cookie
    //跳转到profile页面。
    console.log('signin successfully: %j', req.AV.user);
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

登录页面大概是这样login.ejs:

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

注意： express 框架的 express.session.MemoryStore 在我们云代码中是无法正常工作的，因为我们的云代码是多主机，多进程运行，因此内存型 session 是无法共享的，建议用 [cookieSession中间件](https://gist.github.com/visionmedia/1491756)。
{% endblock %}

{% block cookie_session_middleware %}`AV.Cloud.CookieSession`{% endblock%}

{% block https_redirect %}
```javascript
var HttpsRedirect = AV.Cloud.HttpsRedirect;
app.use(HttpsRedirect());
```
{% endblock %}

{% block get_env %}
```javascript
var NODE_ENV = process.env.NODE_ENV || 'development';
if (NODE_ENV === 'development') {
  // 当前环境为「开发环境」，是由命令行工具启动的
} else if(NODE_ENV == 'production') {
  // 当前环境为「生产环境」，是线上正式运行的环境
} else {
  // 当前环境为「测试环境」
}
```
{% endblock %}

{% block cloud_code_module %}
## 模块

Cloud Code支持将JavaScript代码拆分成各个模块。为了避免加载模块带来的不必要的副作用，Cloud Code模块的运作方式和CommonJS模块类似。当一个模块被加载的时候，JavaScript文件首先被加载，然后执行文件内的源码，并返回全局的export对象。例如，假设`cloud/name.js`包含以下源码：

```javascript
var coolNames = ['Ralph', 'Skippy', 'Chip', 'Ned', 'Scooter'];
exports.isACoolName = function(name) {
  return coolNames.indexOf(name) !== -1;
}
```
然后在`cloud/main.js`包含下列代码片段：

```javascript
var name = require('cloud/name.js');
name.isACoolName('Fred'); // 返回false
name.isACoolName('Skippy'); // 返回true;
name.coolNames; // 未定义.
```
（提示，你可以利用`console.log`来打印这几个调用的返回值到日志）

name模块包含一个名为`isACoolName`的函数。`require`接收的路径是相对于你的Cloud Code项目的根路径，并且只限`cloud/`目录下的模块可以被加载。

### 可用的第三方模块

因为Cloud Code 1.0运行在沙箱环境，我们只允许使用部分类库，这个名单如下：

```
qiniu
underscore
underscore.string
moment
util
express
crypto
url
events
string_decoder
buffer
punycode
querystring
express-ejs-layouts
weibo
node-qiniu
mailgun
mandrill
stripe
sendgrid
xml2js
```
上面这些模块都可以直接require使用。
我们还提供受限制的`fs`文件模块，仅可以读取上传文件目录下的文件。

**云代码 2.0 开始将没有模块限制，但是上述必选的模块仍然将优先使用云代码环境中使用的版本**
{% endblock %}
