{% extends "./acl_quick_start.tmpl" %}

{% block language_version %}JavaScript{% endblock %}
{% block code_not_use_acl %}
<pre lang="javascript">
  // 新建一个帖子对象
  var Post = AV.Object.extend("Post");
  var post = new Post();
  post.set("title", "大家好，我是新人");
  post.save();
</pre>
{% endblock %}

{% block code_use_acl %}

<pre lang="javascript">
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
</pre>

{% endblock %}

{% block link_to_acl_guide %}[LeanCloud 权限管理使用规范](./acl_guide-js.html){% endblock %}
