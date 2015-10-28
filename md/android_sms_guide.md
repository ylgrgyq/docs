# Android SDK 短信验证码使用指南

除了用户相关的包括注册，登录等操作以外，LeanCloud 还支持额外的短信验证码服务。
在实际的应用中，假如有一些相对比较敏感的操作，比如付费、删除重要资源等操作，你希望能够通过短信验证的方式来与用户进行确认，你就可以在用户验证过手机号码，应用管理平台打开了 **启用帐号无关短信验证服务（针对 requestSmsCode 和 verifySmsCode 接口）** 选项的前提下，使用 LeanCloud 提供的短信验证码服务。

下面是使用方法，也可以参考 github 上的 [sms-demo](https://github.com/leancloud/sms-demo) 项目。

## 请求短信验证码
以下操作为给绑定这个手机号码的用户发送验证短信

```java
   AVOSCloud.requestSMSCode("13613613613","应用名","具体操作名称",10);
   //短信格式类似于：
   //

```

短信默认模板为：

<pre ng-non-bindable ><code>
你正在 {{name}}中进行 {{op}}，你的验证码是:{{code}}，请输入验证，有效期为:{{ttl}}分钟
</code></pre>

## 自定义短信模板

如果您想完全自定义短信的内容，可以在应用设置的短信模板创建自定义的短信模板，但是需要**审核**。

在提交了短信模板并且得到审核以后，你可以通过 SDK 来发送符合短信模板的短信给你的用户。

假设您提交了如下的短信模板，并且将这个模板的名称保存为"Register_Template"：

<pre ng-non-bindable ><code>
Hi {{username}},
欢迎注册{{name}}应用，您可以通过验证码:{{code}}，进行注册。本条短信将在{{ttl}}分钟后自行销毁。请尽快使用。
以上。
{{appname}}
</code></pre>

**注：其中的 name、code、ttl 是预留的字段，分别代表应用名、验证码、过期时间。不需要填充内容，会自动填充。**

您可以通过如下代码进行短信发送：

```java
    HashMap<String,Object> env = new HashMap<String,Object>();
    env.put("username",9527);
    env.put("appname", "来自未来的你");
    AVOSCloud.requestSMSCodeInBackgroud("12312312312", "Register_Template", env, new RequestMobileCodeCallback() {

      @Override
      public void done(AVException e) {
         //do something you need
      }
    });
```

## 短信签名说明

短信签名是指短信内容里 `【】` 括起来的短信发送方名称，如果没有明确在模板里指定，默认就是你的应用名称。短信签名**不能超过 10 个字符，不能有任何非文字字符，也不可以是变量**。应用名称可以在应用设置里修改，并且短信签名**必须出现在短信内容的开头或者结尾。**

## 验证短信验证码
你可以通过以下代码来验证短信验证码：

```java
    AVOSCloud.verifySMSCodeInBackground("短信里的6位验证码","11位手机号码", new AVMobilePhoneVerifyCallback() {

      @Override
      public void done(AVException e) {
      //此处可以完成用户想要完成的操作
      }
    });
```
## 短信验证码注册用户

在很多应用场景中间，开发者希望能够实现短信验证码一键登录功能，注册和登录二合一。LeanCloud 也提供了 `AVUser.signUpOrLoginByMobilePhoneInBackground` 来支持这个功能。

首先，你需要通过 `AVOSCloud.requestSMSCodeInBackgroud` 来发送验证码。

```
AVOSCloud.requestSMSCodeInBackground("12312312312",new RequestMobileCodeCallback(){
    public void done(AVException e){
       if(e==null){
       //你可以在这里选择上文提到的自定义短信模板等功能来发送验证码
       }
    }                                                   
});
```

之后就可以通过 `AVUser.signUpOrLoginByMobilePhoneInBackground` 来创建用户，如果这个用户已经创建过，则是完成登录。

```
AVUser.signUpOrLoginByMobilePhoneInBackground("12312312312","smsCode",new LogInCallback<AVUser>(){
   public void done(AVUser user,AVException e){
   //至此就完成了注册或登录的功能。用户的用户名即为手机号码
   }
});
```

默认的用户名为用户的手机号码。

## 常见问题

详情请参照 [短信收发常见问题一览](rest_sms_api.html#常见问题_FAQ)。
