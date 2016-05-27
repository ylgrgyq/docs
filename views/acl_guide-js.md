{% extends "./acl_guide.tmpl" %}

{% block language_version %}JavaScript{% endblock %}
{% block for_front_js %}
### 云引擎使用 ACL
文档中使用的 `AV.User.current()` 这个方法仅仅针对浏览器端有效，在**云引擎中该接口无法使用**。
{% endblock %}
{% block link_to_acl_quickStart %}[权限管理以及 ACL 快速指南](acl_quick_start-js.html){% endblock %}
{% block create_post_set_acl_for_single_user %}

```js
  // 新建一个帖子对象
  var Post = AV.Object.extend("Post");
  var post = new Post();
  post.set("title", "大家好，我是新人");

  // 新建一个 ACL 实例
  var acl = new AV.ACL();
  acl.setPublicReadAccess(true);
  acl.setWriteAccess(AV.User.current(),true);

  // 将 ACL 实例赋予 Post 对象
  post.setACL(acl);
  post.save();
```
```ts
  // 新建一个帖子对象
  let post : AV.Object = new AV.Object("Post");
  post.set('title','大家好，我是新人');

  // 新建一个 ACL 实例
  let acl : AV.ACL = new AV.ACL();
  acl.setPublicReadAccess(true);
  acl.setWriteAccess(AV.User.current(),true);

  // 将 ACL 实例赋予 Post 对象
  post.setACL(acl);
  post.save();
```

{% endblock %}

{% block create_post_set_acl_for_othter_user %}

```js
  // 查找某一个其他用户
  var query = new AV.Query(AV.User);
  query.get("55f1572460b2ce30e8b7afde", {
    success: function(object) {
      // 新建一个帖子对象
      var Post = AV.Object.extend("Post");
      var post = new Post();
      post.set("title", "大家好，我是新人");

      // 新建一个 ACL 实例
      var acl = new AV.ACL();
      acl.setPublicReadAccess(true);
      acl.setWriteAccess(AV.User.current(),true);
      acl.setWriteAccess(object,true);//为该用户设置「写」权限

      // 将 ACL 实例赋予 Post 对象
      post.setACL(acl);
    },

    error: function(object, error) {
      // error is an instance of AV.Error.
    }
  });
```
```ts

```
{% endblock %}

{% block create_role_administrator %}

```javascript
  // 新建一个角色，并把为当前用户赋予该角色
  var administratorRole = new AV.Role("Administrator");//新建角色

  var relation= administratorRole.getUsers();
  administratorRole.getUsers().add(AV.User.current());//为当前用户赋予该角色
  administratorRole.save();//保存
```
{% endblock %}

{% block query_role_administrator %}

```javascript
  var roleQuery = new AV.Query(AV.Role);
  roleQuery.equalTo('name', 'Administrator');
  roleQuery.first({
    success:function(result){
      if(result){
        var userRelation = result.relation("users");
        userRelation.query().find({
          success:function(list){
           // list 就是拥有该角色权限的所有用户了。 
              var firstAdmin=list[0];
          }
        });
      }
    },
    error:function(error){

    }});
```
{% endblock %}

{% block query_role_of_user %}

```javascript
  var roleQuery = new AV.Query(AV.Role);
  roleQuery.equalTo('users', AV.User.current());
  roleQuery.find({
    success:function(roles){
      // roles 就是一个 AVRole 的数组，这些 AVRole 就是当前用户所在拥有的角色
      console.log(roles);
      response.success(200);
    },error:function(error){ 
      
    }
  });
```
{% endblock %}

{% block query_user_of_role %}

```
  var roleQuery = new AV.Query(AV.Role);
  roleQuery.get('55f1572460b2ce30e8b7afde',{
    success:function(role){
       var userRelation= role.getUsers();//获取 Relation 实例
       userRelation.find({
         success: function(results) {
        // results 就是拥有 role 角色的所有用户了
        },
        error: function(error) {
          // error is an instance of AV.Error.
          }
       });
    },
    error:function(object,error){
       // error is an instance of AV.Error.
    }
  });
```
{% endblock %}

{% block set_acl_for_role %}

```
  // 新建一个帖子对象
  var Post = AV.Object.extend("Post");
  var post = new Post();
  post.set("title", "大家好，我是新人");
  
  // 新建一个角色，并把为当前用户赋予该角色
  var administratorRole = new AV.Role("Administrator");//新建角色

  var relation= administratorRole.getUsers();
  administratorRole.getUsers().add(AV.User.current());//为当前用户赋予该角色
  administratorRole.save().then(function(administratorRole) {//角色保存成功
  
    // 新建一个 ACL 实例
    var acl = new AV.ACL();
    acl.setPublicReadAccess(true);
    acl.setRoleWriteAccess(administratorRole,true);
    
    // 将 ACL 实例赋予 Post 对象
    post.setACL(acl);
    
    post.save(null, {
      success: function(post) {
  },
  error: function(post, error) {
    console.log(error);
    }
  });
  }, function(error) {
      //角色保存失败，处理 error
  });
```
{% endblock %}


{% block add_role_for_user %}

```
  // 构建 AV.Role 的查询
  var roleQuery = new AV.Query(AV.Role);
  roleQuery.equalTo('name','Administrator');
  roleQuery.find({
    success:function(results){
      // 如果角色存在
      if(results.length > 0){
        var administratorRole = results[0];
        roleQuery.equalTo('users',AV.User.current());
        roleQuery.find({
          success:function(userForRole){
            if(userForRole.length == 0){//该角色存在，但是当前用户未被赋予该角色
              // 为当前用户赋予该角色
               var relation= administratorRole.getUsers();
               administratorRole.getUsers().add(AV.User.current());
               administratorRole.save();
            }
          },error:function(errorForUserQuery){
            
          }
        });
      } else{
        // 如果角色不就新建角色，并把为当前用户赋予该角色
        var administratorRole = new AV.Role("Administrator");//新建角色
        var relation= administratorRole.getUsers();
        administratorRole.getUsers().add(AV.User.current());//为当前用户赋予该角色
        administratorRole.save();//保存
      }
    },error:function(error){
      
    }
  });
```
{% endblock %}

{% block remove_role_from_user %}

```
  // 构建 AV.Role 的查询
  var roleQuery = new AV.Query(AV.Role);
  roleQuery.equalTo('name','Moderator');
  roleQuery.find({
    success:function(results){
      // 如果角色存在
      if(results.length > 0){
        var moderatorRole = results[0];
        roleQuery.equalTo('users',AV.User.current());
        roleQuery.find({
          success:function(userForRole){
            if(userForRole.length > 0){//该角色存在，并且也拥有该角色
              // 剥夺角色
               var relation= moderatorRole.getUsers();
               moderatorRole.getUsers().remove(AV.User.current());
               moderatorRole.save();
            }
          },error:function(errorForUserQuery){
            
          }
        });
      }
    },error:function(error){
      
    }
  });
```
{% endblock %}

{% block asign_role_to_parent %}

```
  // 建立版主和论坛管理员之间的
  var administratorRole = new AV.Role("Administrator");//新建角色
  var moderatorRole = new AV.Role("Moderator");//新建角色
  AV.Promise.when(
     // 
     administratorRole.save(),
     moderatorRole.save()
   ).then(function (r1, r2) {
     // 将 Administrator 设为 moderatorRole 一个子角色
     moderatorRole.getRoles().add(administratorRole);
     moderatorRole.save();//保存
   });
```
{% endblock %}

{% block share_role %}

```
  var photographicRole=new AV.Role("Photographic");//新建摄影器材版主角色
  var mobileRole=new AV.Role("Mobile");//新建手机平板版主角色
  var digitalRole=new AV.Role("Digital");//新建电子数码版主角色

   AV.Promise.when(
     // 先行保存 photographicRole 和 mobileRole
     photographicRole.save(),
     mobileRole.save()
   ).then(function (r1, r2) {
     // 将 photographicRole 和 mobileRole 设为 digitalRole 一个子角色
     digitalRole.getRoles().add(photographicRole);
     digitalRole.getRoles().add(mobileRole);
     digitalRole.save();//保存
     
      // 新建一个帖子对象
      var Post = AV.Object.extend("Post");
      
      // 新建摄影器材板块的帖子
      var photographicPost = new Post();
      photographicPost.set("title", "我是摄影器材板块的帖子！");
      
      // 新建手机平板板块的帖子
      var mobilePost = new Post();
      mobilePost.set("title", "我是手机平板板块的帖子！");
      
      // 新建电子数码板块的帖子
      var digitalPost = new Post();
      digitalPost.set("title", "我是电子数码板块的帖子！");
      
      
      // 新建一个摄影器材版主可写的 ACL 实例
      var photographicACL = new AV.ACL();
      photographicACL.setPublicReadAccess(true);
      photographicACL.setRoleWriteAccess(photographicRole,true);
      
      // 新建一个手机平板版主可写的 ACL 实例
      var mobileACL = new AV.ACL();
      mobileACL.setPublicReadAccess(true);
      mobileACL.setRoleWriteAccess(mobileRole,true);
      
      // 新建一个手机平板版主可写的 ACL 实例
      var digitalACL = new AV.ACL();
      digitalACL.setPublicReadAccess(true);
      digitalACL.setRoleWriteAccess(digitalRole,true);
      
      // photographicPost 只有 photographicRole 可以读写
      // mobilePost 只有 mobileRole 可以读写
      // 而 photographicRole，mobileRole，digitalRole 均可以对 digitalPost 进行读写
      photographicPost.setACL(photographicACL);
      mobilePost.setACL(mobileACL);
      digitalPost.setACL(digitalACL);
      
      AV.Promise.when(
        photographicPost.save(),
        mobilePost.save(),
        digitalPost.save()
        ).then(function (r1,r2,r3) {
          // 保存成功
          }, function(errors){
            // 保存失败
      });
   });
```

{% endblock %}



