{% extends "./leanengine_guide.tmpl" %}

{% block updateToLeanEngine%}
### 升级到 LeanEngine
云代码 2.0 和 LeanEngine 的差别主要是应用的目录结构：因为 LeanEngine 没有沙箱环境，所以不强制 `cloud` 和 `config` 等目录结构，只要是一个普通的 Node.js 项目即可。而 SDK 将作为一个普通组件添加到项目中，所以使用方面也有一些变化：

* 需要自己初始化 AV 对象：云代码 2.0 的环境会直接将 AV 对象初始化并保存在沙箱环境上下文中，所以可以不需要任何声明而直接使用。我们认为这样会略微违反知觉,所以 LeanEngine 环境需要自行初始化 AV 对象，而且可以根据需要来决定此过程是否使用 masterKey 。
* 时区：云代码 2.0 默认使用 UTC 时区，这给很多开发者带来了困惑。所以 LeanEngine 默认情况使用东八区时区，在 [时区]() 部分详细讨论这个问题。
* `avos-express-cookie-session` 的改变：该组件不再依赖 `cookie-parse`，而且引入方式发生变化，详情见 [TODO]()。
* 运行环境判断：云代码 2.0 使用 `__production` 全局变量判断当前环境是「测试环境」还是「生产环境」，而 LeanEngine 尊重 Node.js 的习惯，使用 `NODE_ENV` 这个变量来进行区分，`test` 为测试环境，`production` 为生产环境。
{% endblock %}

{% block createProject %}
首先请安装好 [node.js](https://nodejs.org/) 与 [npm](https://www.npmjs.com/)。

**注意**： 目前 LeanEngine 的 node.js 版本为 0.12，请你最好使用此版本的 node.js 进行开发，至少不要低于 0.10 。

推荐使用 node-js-getting-started 项目作为起步，这是一个简单的 Express 4 的项目。

从 Github 迁出，或从 [这里](https://github.com/leancloud/node-js-getting-started/archive/master.zip) 下载并解压：

```
$ git clone git@github.com:leancloud/node-js-getting-started.git
$ cd node-js-getting-started
```

准备启动文件:

```
$ cp start.sh.example start.sh
$ chmod +x start.sh
```

将 appId 等信息更新到 `start.sh` 文件中：

```
export LC_APP_ID=<your app id>
export LC_APP_KEY=<your app key>
export LC_APP_MASTER_KEY=<your master key>
```
{% endblock %}

{% block run_in_local_command %}
```
$ ./start.sh
```
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
