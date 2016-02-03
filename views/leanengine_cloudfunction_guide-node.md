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