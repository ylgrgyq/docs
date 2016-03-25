{% extends "./leanengine_cloudfunction_guide.tmpl" %}

{% set platformName = 'Node.js' %}
{% set productName = 'LeanEngine' %}
{% set storageName = 'LeanStorage' %}
{% set hook_before_save   = "beforeSave" %}
{% set hook_after_save    = "afterSave" %}
{% set hook_before_update = "beforeUpdate" %}
{% set hook_after_update  = "afterUpdate" %}
{% set hook_before_delete = "beforeDelete" %}
{% set hook_after_delete  = "afterDelete" %}
{% set hook_on_verified   = "onVerified" %}
{% set hook_on_login      = "onLogin" %}

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
  var query = new AV.Query('Post');
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

{% block beforeUpdateExample %}

```javascript
AV.Cloud.beforeUpdate('Review', function(request, response) {
  // 如果 comment 字段被修改了，检查该字段的长度
  if (request.object.updatedKeys.indexOf('comment') != -1) {
    if (request.object.get('comment').length <= 140) {
      response.success();
    } else {
      // 拒绝过长的修改
      response.error('commit 长度不得超过 140 字符');
    }
  } else {
    response.success();
  }
});
```

请注意：

* 需要将 `leanengine` 中间件升级至 0.2.0 版本以上才能使用这个功能。
* 不要修改 `request.object`，因为对它的改动并不会保存到数据库，但可以用 `response.error` 返回一个错误，拒绝这次修改。
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
  var query = new AV.Query('Photo');
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
  var query = new AV.Query('Photo');
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
错误响应码允许自定义。云引擎方法最终的错误对象如果有 `code` 和 `message` 属性，则响应的 body 以这两个属性为准，否则 `code` 为 1， `message` 为错误对象的字符串形式。比如：

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

{% block errorCodeExampleForHooks %}
```
AV.Cloud.beforeSave('Review', function(request, response) {
  // 使用 JSON.stringify() 将 object 变为字符串
  response.error(JSON.stringify({
    code: 123,
    message: '自定义错误信息'
  }));
});
```
{% endblock %}



{% block code_averageStars_sample %}

```js
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
      response.error('搜索失败');
    }
  });
```
{% endblock %}

{% block timerLegacy %}
**原来提供的 `AV.Cloud.setInterval` 和 `AV.Cloud.cronjob` 都已经废弃，这两个函数的功能变成和 `AV.Cloud.define` 一样，已经定义的任务会自动帮你做转换并启动。**
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
//参数依次为 AppId, AppKey, MasterKey
AV.initialize('{{appid}}', '{{appkey}}', '{{masterkey}}');
AV.Cloud.useMasterKey();
```
{% endblock %}

{% block masterKeyInitLegacy %}
**注意：**云引擎 2.0 版本已经默认使用 master key 初始化 SDK，所以不需要额外初始化。
{% endblock %}

{% block loggerExample %}
```javascript
AV.Cloud.define('Logger', function(request, response) {
  console.log(request.params);
  response.success();
});
```
{% endblock %}
