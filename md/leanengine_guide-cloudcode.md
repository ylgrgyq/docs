# LeanEngine 指南

## 介绍

为了在服务端执行一些业务逻辑操作，你需要使用我们提供的 LeanEngine，编写 JavaScript 或者 Python 代码，并部署到我们的平台上。通过 LeanEngine，你可以拦截save请求，在 save object 之前或之后做一些事情；你也可以自定义业务函数，并通过 SDK 调用；你还可以调用部分第三方库来实现你的业务逻辑；甚至，你可以将整个网站架设在 LeanEngine 之上，我们提供了web hosting 服务。详细介绍如下。

现在我们将云代码的功能做了升级，开放性更高，并且更名为「LeanEngine」。老的云代码产品将继续运行并且维护下去，但是云代码上的功能都可以在 LeanEngine 实现，并且自由度更高，因此我们强烈建议你将你的项目改为 LeanEngine 实现。

### 与云代码的区别

* 多语言支持：目前支持 Node.js 与 Python，将来会支持更多的编程语言运行环境。
* 标准的运行环境：之前云代码是我们订制的一个沙箱运行环境，功能受限，并且代码只可以在云代码环境运行，难以迁移到自己搭建的后端服务器上。而 LeanEngine 环境可以部署标准项目。




## 云代码 2.0 版

2014 年 8 月 14 号，Cloud Code 推出 2.0 版本，最主要特性：可以自由添加和使用三方类库，去除一些对模块的限制。从 14 号开始，新创建的应用都将使用云代码2.0版本。

### 升级到 2.0

1. 时区问题：2.0版彻底修复了时区问题，应用不再需要自己对时间做 8 小时的时区修正。所以需要确认，在迁移到云代码2.0之前，移除代码中之前对时间修正的部分代码。
1. 引入 package.json （可选）：如果项目需要引入其他三方类库，可以像标准 node.js 项目一样，在项目根目录添加一个 `package.json` 配置文件，下面是一个简单的样例：

```json
{
    "name": "cloud-code-test",
    "description": "Cloud Code test project.",
    "version": "0.0.1",
    "private": true,
    "dependencies": {
        "async": "0.9.x"
    }
}
```

需要注意的是，cloud-code 运行环境默认包含一些组件，如果 `package.json` 指定明确版本则以用户自定义的为准，否则使用下面的默认版本：

```
nodejs: "0.10.29"
qiniu: "6.1.3"
underscore: "1.6.0"
underscore.string: "2.3.3"
moment: "2.7.0"
express-ejs-layouts: "0.3.1"
weibo: "0.6.9"
node-qiniu: "6.1.6"
mailgun: "0.4.2"
mandrill: "0.1.0"
stripe: "2.5.0"
sendgrid: "1.0.5"
xml2js: "0.4.4"
```

**注意**：`express` 目前只支持 `3.4.x` 版本，即使 `package.json` 指定其他版本也是无效的。

在以上问题都确认后，就可以进行升级动作。升级操作完成后，因为缓存的原因，需要等待最多5分钟，平台将自动迁移完成，在5分钟迁移时间内，老的云代码将继续提供服务，因此无需担心迁移期间服务暂停。

### 最新特性

* 有着更好的资源隔离机制，因此 `fs` 等官方模块的限制取消了。
* 可以自由添加和使用三方类库
* 时区问题彻底解决
* `views` 目录不再需要分成两个目录（ `cloud/views` 和 `cloud/dev_views` ）
* 修正：项目从代码仓库迁出有可能失败的问题


## 创建项目


首先请安装好 [node.js](https://nodejs.org/) 与 [npm](https://www.npmjs.com/)。

### 下载项目框架

你可以在 云代码 -> 设置 页面下载到项目框架：

![image](images/cloud_code_skeleton.png)

点击 `下载项目框架(基本版)` 链接，会自动下载一个初始的项目框架，下载后的文件是一个 zip 打包文件，请解压该文件，会看到一个以 App 名称命名的目录，这个目录即可作为你的项目开始。

### 命令行工具创建项目

另外一种创建项目的方式是使用 [命令行工具](https://leancloud.cn/docs/cloud_code_commandline.html)，通过该工具可以创建、部署、发布、回滚、查询云代码，并且支持多应用管理。

在需要的目录执行指令：

```
avoscloud new
```

然后根据提示输入 appId、masterKey，选择项目类型即可创建项目。

### 项目框架

不管使用上述哪种方式创建项目，最终的目录结构都是这样：

```
<appName>
├── README.md
├── cloud
│   └── main.js
├── config
│   └── global.json
└── public
    └── index.html
```
其中：

* cloud 目录下有一个 `main.js`，这就是你的业务逻辑代码存放的地方，初始内容定义了一个函数，代码如下：

```javascript
// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:
AV.Cloud.define('hello', function(request, response) {
  response.success('Hello world!');
});
```
  
  这段代码定义了一个名为`hello`的函数，它简单的返回应答`Hello world!`。

* config 目录下是项目的配置文件 `global.json`，已经按照你的项目信息（主要是 appId 和 appKey）帮你自动配置好了。
* public 目录，用于存放 [Web Hosting](#web-hosting) 功能的静态资源文件，具体请看后面的介绍。



### 本地运行

在你的项目根目录执行：


```
$ avoscloud
```
**注意**：云代码 2.0 的项目本地运行需要安装 [命令行工具](https://leancloud.cn/docs/cloud_code_commandline.html)

访问 [http://localhost:3000/]() 即可访问你的项目。

### 其他框架


因为云代码 2.0 是运行在沙箱环境，所以不支持其他的 web 框架。只能使用预定义的 Express 3.x。


## 部署

首先，你需要将这个项目提交到一个 git 仓库，LeanCloud并不提供源码的版本管理功能，而是借助于git这个优秀的分布式版本管理工具。我们推荐你使用[CSDN Code平台](https://code.csdn.net/)，[github](https://github.com/)或者[BitBucket](https://bitbucket.org/)这样第三方的源码
托管网站，也可以使用你自己搭建的git仓库(比如使用[gitlab.org](http://gitlab.org/))。下面我们详细描述下怎么使用。

### 使用 CSDN Code 托管源码

CSDN CODE 是国内非常优秀的源码托管平台，你可以使用 CODE 平台提供公有仓库和有限的私有仓库完成对代码的管理功能。

以下是使用CODE平台与LeanCloud云代码结合的一个例子。
首先在CODE上创建一个项目

![image](../images/csdn_code1.png)

**提示**：在已经有项目代码的情况下，一般不推荐”使用README文件初始化项目”

接下来按照给出的提示，将源代码push到这个代码仓中

```sh
cd ${PROJECT_DIR}
git init
git add *
git commit -m "first commit"
git remote add origin git@code.csdn.net:${yourname}/test.git
git push -u origin master
```

我们已经将源码成功推送到CODE平台，接下来到LeanCloud云代码的管理界面填写下你的git地址（请注意，一定要填写以`git@`开头的地址，我们暂不支持https协议clone源码）并点击save按钮保存：

![image](../images/csdn_code2.png)

添加 deploy key 到你的 CODE 平台项目上（deploy key是我们LeanCloud机器的ssh public key）
保存到”项目设置””项目公钥”中，创建新的一项avoscloud:

![image](../images/csdn_code3.png)

下一步，部署源码到测试环境，进入 云代码 -> Git 部署 菜单，点击「部署到开发环境」的部署按钮：

![image](../images/cloud_code_5.png)

部署成功后，可以看到开发环境版本号从 undeploy 变成了当前提交的源码版本号。


### 使用 GitHub 托管源码

使用BitBucket与此类似，不再赘述。

[Github](https://github.com)是一个非常优秀的源码托管平台，你可以使用它的免费帐号，那将无法创建私有仓库(bucket可以创建私有仓库)，也可以付费成为高级用户，可以创建私有仓库。

首先在github上创建一个项目，比如就叫`test`:

![image](../images/github1.png)

![image](../images/github2.png)

接下来按照github给出的提示，我们将源码push到这个代码仓库：

```sh
cd ${PROJECT_DIR}
git init
git add *
git commit -m "first commit"
git remote add origin git@github.com:${yourname}/test.git
git push -u origin master
```

到这一步我们已经将源码成功push到github，接下来到Cloud Code的管理界面填写下你的git地址（请注意，一定要填写以`git@`开头的地址，我们暂不支持https协议clone源码）并点击save按钮保存：

![image](../images/cloud_code_4.png)

并添加deploy key到你的github项目（deploy key是我们Cloud code机器的ssh public key），如果你是私有项目，需要设置deploy key，

拷贝 `设置` 菜单里的 `Deploy key` 保存到 github setting 里的deploy key，创建新的一项avoscloud:

![image](../images/cloud_code_github_deploy_key.png)

下一步，部署源码到测试环境，进入 云代码 -> Git 部署 菜单，点击「部署到开发环境」的部署按钮：

![image](../images/cloud_code_5.png)

部署成功后，可以看到开发环境版本号从 undeploy 变成了当前提交的源码版本号。

### Gitlab 无法部署问题

很多用户自己使用[Gitlab](http://gitlab.org/)搭建了自己的源码仓库，有朋友会遇到无法部署到LeanCloud 的问题，即使设置了Deploy Key，却仍然要求输入密码。

可能的原因和解决办法如下：

* 确保你gitlab运行所在服务器的/etc/shadow文件里的git（或者gitlab）用户一行的`!`修改为`*`，原因参考[这里](http://stackoverflow.com/questions/15664561/ssh-key-asks-for-password)，并重启SSH服务`sudo service ssh restart`。
* 在拷贝deploy key时，确保没有多余的换行符号。
* Gitlab目前不支持有comment的deploy key。早期LeanCloud 用户生成的deploy key可能带comment，这个comment是在deploy key的末尾76个字符长度的字符串，例如下面这个deploy key:

```
ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEA5EZmrZZjbKb07yipeSkL+Hm+9mZAqyMfPu6BTAib+RVy57jAP/lZXuosyPwtLolTwdyCXjuaDw9zNwHdweHfqOX0TlTQQSDBwsHL+ead/p6zBjn7VBL0YytyYIQDXbLUM5d1f+wUYwB+Cav6nM9PPdBckT9Nc1slVQ9ITBAqKZhNegUYehVRqxa+CtH7XjN7w7/UZ3oYAvqx3t6si5TuZObWoH/poRYJJ+GxTZFBY+BXaREWmFLbGW4O1jGW9olIZJ5/l9GkTgl7BCUWJE7kLK5m7+DYnkBrOiqMsyj+ChAm+o3gJZWr++AFZj/pToS6Vdwg1SD0FFjUTHPaxkUlNw== App dxzag3zdjuxbbfufuy58x1mvjq93udpblx7qoq0g27z51cx3's cloud code deploy key
```
其中最后76个字符

```
App dxzag3zdjuxbbfufuy58x1mvjq93udpblx7qoq0g27z51cx3's cloud code deploy key
```

就是comment，删除这段字符串后的deploy key(如果没有这个字样的comment无需删除)保存到gitlab即可正常使用:

```
ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEA5EZmrZZjbKb07yipeSkL+Hm+9mZAqyMfPu6BTAib+RVy57jAP/lZXuosyPwtLolTwdyCXjuaDw9zNwHdweHfqOX0TlTQQSDBwsHL+ead/p6zBjn7VBL0YytyYIQDXbLUM5d1f+wUYwB+Cav6nM9PPdBckT9Nc1slVQ9ITBAqKZhNegUYehVRqxa+CtH7XjN7w7/UZ3oYAvqx3t6si5TuZObWoH/poRYJJ+GxTZFBY+BXaREWmFLbGW4O1jGW9olIZJ5/l9GkTgl7BCUWJE7kLK5m7+DYnkBrOiqMsyj+ChAm+o3gJZWr++AFZj/pToS6Vdwg1SD0FFjUTHPaxkUlNw==
```

## 环境变量

LeanEngine 上有一些平台相关的环境变量，可以在你的代码中使用。

* `LC_APP_ID`: 当前应用的 App Id
* `LC_APP_KEY`: 当前应用的 App Key
* `LC_APP_MASTER_KEY`: 当前应用的 Master Key
* `LC_APP_ENV`: 当前应用环境，测试环境值为 `test`，生产环境值为 `production`
* `LC_APP_PORT`: 当前应用开放给外网的端口，只有监听此端口，用户才可以访问到你的服务

## 使用数据存储

你可以直接在 LeanEngine 上使用我们的[数据存储](https://leancloud.cn/features/storage.html)服务。

## 使用 LeanEngine 中间件

### 安装


因为云代码 2.0 是运行在沙箱环境，所以不需要安装和初始化，直接可以在项目中使用。


## Cloud 函数

让我们看一个明显更复杂的例子来展示Cloud Code的用途。在云端进行计算的一个重要理由是，你不需要将大量的数据发送到设备上做计算，而是将这些计算放到服务端，并返回结果这一点点信息就好。例如，假设你写了一个App，可以让用户对电影评分，一个评分对象大概是这样：

```json
{
  "movie": "The Matrix",
  "stars": 5,
  "comment": "Too bad they never made any sequels."
}
```

`stars`表示评分，1-5。如果你想查找《黑客帝国》这部电影的平均分，你可以找出这部电影的所有评分，并在设备上根据这个查询结果计算平均分。但是这样一来，尽管你只是需要平均分这样一个数字，却不得不耗费大量的带宽来传输所有的评分。通过Cloud Code，我们可以简单地传入电影名称，然后返回电影的平均分。

Cloud函数接收JSON格式的请求对象，我们可以用它来传入电影名称。整个AVCloud JavaScript SDK都在Cloud Code运行环境上有效，可以直接使用，所以我们可以使用它来查询所有的评分。结合一起，实现`averageStars`函数的代码如下:


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


`averageStars`和`hello`函数的唯一区别是当我们调用函数的时候，我们必须提供参数给`request.params.movie`。继续读下去，我们将介绍如何调用Cloud函数。

### 调用一个函数

Cloud函数可以被各种客户端SDK调用，也可以通过REST API调用，例如，使用一部电影的名称去调用`averageStars`函数：

```sh
curl -X POST -H "Content-Type: application/json; charset=utf-8" \
       -H "X-AVOSCloud-Application-Id: " \
       -H "X-AVOSCloud-Application-Key: " \
       -H "X-AVOSCloud-Application-Production: 0" \
       -d '{"movie":"The Matrix"}' \
https://leancloud.cn/1.1/functions/averageStars
```


有两个参数会被传入到Cloud函数：

* request - 包装了请求信息的请求对象，下列这些字段将被设置到request对象内:
 * params - 客户端发送的参数对象
 * user - `AV.User` 对象，发起调用的用户，如果没有登录，则不会设置此对象。如果通过 REST API 调用时模拟用户登录，需要增加一个头信息 `X-AVOSCloud-Session-Token: <sessionToken>`，该 `sessionToken` 在用户登录或注册时服务端会返回。
* response - 应答对象，包含两个函数：
 * success - 这个函数可以接收一个额外的参数，表示返回给客户端的结果数据。这个参数对象可以是任意的JSON对象或数组，并且可以包含`AV.Object`对象。
 * error - 如果这个方法被调用，则表示发生了一个错误。它也接收一个额外的参数来传递给客户端，提供有意义的错误信息。


如果函数调用成功，返回给客户端的结果类似这样：

```json
{
  "result": 4.8
}
```

如果调用有错误，则返回：

```json
{
  "code": 141,
  "error": "movie lookup failed"
}
```

#### 在云代码里调用已定义的函数

使用 `AV.Cloud.run` 可以在云代码中调用 `AV.Cloud.define` 定义的云代码函数：


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


API参数详解参见 [AV.Cloud.run](https://leancloud.cn/docs/api/javascript/symbols/AV.Cloud.html#.run)。

### 在 save 前修改对象

在某些情况下，你可能不想简单地丢弃无效的数据，而是想清理一下再保存。`beforeSave`可以帮你做到这一点。

在我们电影评分的例子里，你可能想保证评论不要过长，太长的单个评论可能难以显示。我们可以使用`beforeSave`来截断评论到140个字符：


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


### 在 save 后执行动作

在另一些情况下，你可能想在保存对象后做一些动作，例如发送一条push通知。类似的，你可以通过`afterSave`函数做到。举个例子，你想跟踪一篇博客的评论总数字，你可以这样做：


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


在用户注册成功之后如果你想做一些事情可以定义以下函数：


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


如果`afterSave`函数调用失败，save请求仍然会返回成功应答给客户端。`afterSave`发生的任何错误，都将记录到 LeanEngine 日志里。

### 在 update 更新后执行动作

同样，除了保存对象之外，更新一个对象也是很常见的操作，我们允许你在更新对象后执行特定的动作，这是通过`afterUpdate`函数做到。比如每次修改文章后简单地记录日志：


```javascript
AV.Cloud.afterUpdate('Article', function(request) {
   console.log('Updated article,the id is :' + request.object.id);
});
```


**注意**：云代码没有 beforeUpate 函数。

### 在 delete 前执行动作

很多时候，你希望在删除一个对象前做一些检查工作。比如你要删除一个相册(Album)前，会去检测这个相册里的图片(Photo)是不是已经都被删除了，这都可以通过`beforeDelete`函数来定义一个钩子（callback）函数来做这些检查，示例代码：


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


### 在 delete 后执行动作

另一些情况下，你可能希望在一个对象被删除后执行操作，例如递减计数、删除关联对象等。同样以相册为例，这次我们不在beforeDelete中检查是否相册中还有照片，而是在相册删除后，同时删除相册中的照片，这是通过`afterDelete`函数来实现：


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


### 用户验证通知函数

很多时候，你希望在用户通过邮箱或者短信验证的时候对该用户做一些其他操作，可以增加`onVerified`函数：


```javascript
AV.Cloud.onVerified('sms', function(request, response) {
    console.log('onVerified: sms, user: ' + request.object);
    response.success();
```


函数的第一个参数是验证类型：短信验证为`sms`，邮箱验证为`email`。另外，数据库中相关的验证字段，如`emailVerified`不需要修改，我们已经为你更新完成。

### 用户登录时执行动作

有些时候你可能需要禁止一些用户登录（比如黑名单内的用户），可以定义以下函数：


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


### 错误响应码

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


客户端收到的响应：`{"code":211,"error":"Could not find user"}`


```
AV.Cloud.define('customErrorCode', function(req, res) {
  res.error({code: 123, message: 'custom error message'});
});
```


客户端收到的响应： `{"code":123,"error":"custom error message"}`

## 定时任务

很多时候可能你想做一些定期任务，比如半夜清理过期数据，或者每周一给所有用户发送推送消息等等，我们提供了定时任务给您，让您可以在云代码中运行这样的任务。

**我们提供的定时任务的最小时间单位是秒，正常情况下我们都能将误差控制在秒级别。**


**原来提供的`AV.Cloud.setInterval`和`AV.Cloud.cronjob`都已经废弃，这两个函数的功能变成和`AV.Cloud.define`一样，已经定义的任务会自动帮您做转换并启动**


定时任务也是普通的云代码函数，比如我们定义一个打印循环打印日志的任务`log_timer`：


```javascript
AV.Cloud.define('log_timer', function(req, res){
    console.log('Log in timer.');
    return res.success();
});
```


部署云代码之后，进入云代码管理菜单，左侧有个定时任务菜单：

![image](images/schedule_timer1.png)

选择创建定时器，选择定时任务执行的函数名称，执行环境等等：

![image](images/schedule_timer2.png)

定时任务分为两类：

* 使用标准的crontab语法调度
* 简单的循环调度，我们这里以循环调度为例，每隔5分钟打印日志

创建后，定时任务还没有启动，您需要在定时任务列表里启动这个任务:

![image](images/schedule_timer3.png)

接下里就可以在云代码日志里看到这条日志的打印：

![image](images/schedule_timer4.png)

我们再尝试定义一个复杂一点的任务，比如每周一早上8点准时发送推送消息给用户：


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


创建定时器的时候，选择cron表达式并填写为`0 0 8 ? * MON`。

crontab的基本语法是

```
秒 分钟 小时 每个月的日期（Day-of-Month）月份 星期（Day-of-Week） 年（可选）
```

一些常见的例子如下：

* "0 0/5 * * * ?"   每隔5分钟执行一次
* "10 0/5 * * * ?"  每隔5分钟执行一次，每次执行都在分钟开始的10秒，例如10:00:10，然后10:05:10等等。
* "0 30 10-13 ? * WED,FRI"  每周三和每周五的10:30, 11:30, 12:30和13:30执行。
* "0 0/30 8-9 5,20 * ?" 每个月的5号和20号的8点和10点之间每隔30分钟执行一次，也就是8:00, 8:30, 9:00和9:30。


## 资源限制


### 权限说明

云代码可以有超级权限，使用 master key 调用所有 API，因此会忽略 ACL 和 Class Permission 限制。你只需要使用下列代码来初始化 SDK：


```javascript
AV.initialize('app id', 'app key', 'master key');
AV.Cloud.useMasterKey();
```


如果在你的服务端环境里也想做到超级权限，也可以使用该方法初始化。


**注意：**云代码 2.0 版本已经默认使用 masterKey 初始化 SDK，所以不需要额外初始化。


### 定时器数量

开发环境和测试环境的定时器数量都限制在 3 个以内，也就是说你总共最多可以创建 6 个定时器。

### 超时

Cloud函数如果超过15秒没有返回，将被强制停止。`beforeSave`和`afterSave`函数的超时时间限制在3秒内。如果`beforeSave`和`afterSave`函数被其他的Cloud函数调用，那么它们的超时时间会进一步被其他Cloud函数调用的剩余时间限制。例如，如果一个`beforeSave`函数
是被一个已经运行了13秒的Cloud函数触发，那么`beforeSave`函数就只剩下2秒的时间来运行，而正常情况下是3秒的限制。

Web Hosting的动态请求超时也被限定为15秒。

### 网络请求

当`success`和`error`方法调用后，仍然在运行的网络请求将被取消掉。通常来说，你应该等待所有的网络请求完成，再调用`success`。对于`afterSave`函数来说，它并不需要调用`success`或者`error`，因此Cloud Code会等待所有的网络请求调用结束。

## 日志

[云代码->日志](/cloud.html?appid=#/log)，可以查看Cloud Code的部署和运行日志，还可以选择查看的日志级别：

![image](images/cloud_code_11.png)


如果你想打印日志到里面查看，可以直接输出到「标准输出」或者「标准错误」，这些信息会分别对应日志的 `info` 和 `error` 级别，比如下列代码会在 info 级别记录参数信息：


```javascript
AV.Cloud.define('Logger', function(request, response) {
  console.log(request.params);
  response.success();
});
```


## Web Hosting

很多时候，除了运行在移动设备的App之外，您通常也会为App架设一个网站，可能只是简单地展现App的信息并提供AppStore或者Play商店下载链接，或者展示当前热门的用户等等。您也可能建设一个后台管理系统，用来管理用户或者业务数据。
这一切都需要您去创建一个web应用，并且从VPS厂商那里购买一个虚拟主机来运行web应用，您可能还需要去购买一个域名。

不过现在，Cloud code为您提供了web hosting功能，可以让你设置一个App的二级域名`xxx.avosapps.com`（美国区为 `xxx.avosapps.us` ），并部署您的web应用到该域名之下运行。同时支持静态资源和动态请求服务。

### 设置域名

首先，你需要到 云代码 -> 设置 页面找到 `Web 主机域名`，在这里填写您的域名：

![image](images/cloud_code_web_setting.png)

上面将App的二级域名设置为 `myapp`，设置之后，您应该可以马上访问 `http://myapp.avosapps.com` 或 `http://myapp.avosapps.us`（可能因为DNS生效延迟暂时不可访问，请耐心等待或者尝试刷新DNS缓存），如果还没有部署，您看到的应该是一个404页面。

### 绑定独立域名

只有主域名是需要备案的，二级子域名不需要备案。

#### 主域名

仅使用云代码托管静态文件、未使用其他 LeanCloud 服务的用户，需要自行办理独立域名与 App 绑定的相关手续。

其他用户如果需要为 App 绑定一个独立域名，可以使用账户注册邮箱将下列信息发送至 <support@leancloud.rocks> ，或者从控制台菜单中选择 **帮助** > **技术支持** ，通过工单来提出申请 ：

* 您已经绑定的avosapps.com或avosapps.us二级子域名（请参考设置域名）
* 您想要绑定的域名（必须是您名下的域名，并且您也已经将CNAME或者A记录指向了avosapps.com(国内)或avosapps.us(美国)）
* 您的注册邮箱（必须与发送者的邮箱一致）
* 您想要绑定的App Id（该应用必须位于注册邮箱的用户名下）
* 您的域名的备案信息 （**国内必须可以在工信部查询到，美国区不需要**）

我们将在3个工作日内审核，如果审核通过将为您绑定域名。

#### 域名备案流程

**域名备案的前置条件：云代码已经部署，并且网站内容和备案申请的内容一致。**

仅使用云代码托管静态文件、未使用其他 LeanCloud 服务的企业用户，请自行完成域名备案工作。

其他企业用户，若尚未在国内对其域名进行过备案，可以申请由我们协助来完成备案工作。其流程大致如下：

1. 您提供相应资料，我们来录入
2. 我们的备案接入商给您邮寄幕布，进行拍照验证，并将其它资料签字盖章后一起邮寄给备案提供商
3. 提交备案到（公司所在地）管局（通信管理局）审核

请注意：**国内各地管局对备案的政策有差别，具体请查询当地管局**

#####第一步：

请提交以下资料，我们来帮您录入到系统：

1. 单位名称、单位通信地址、营业执照号码、营业执照副本扫描件
2. 企业法人姓名、身份证号码、身份证扫描件电子档（正反面需在一起）、邮箱、手机号、电话（归属地为公司所在地）、QQ号码
3. 如果网站负责人和法人不为同一人话，还需要提供网站负责人的姓名、身份证号码、身份证扫描件电子档（正反面需在一起）、邮箱、手机号、电话（归属地为公司所在地）、联系地址 （可以为单位通信地址）、QQ号码
4. 网站名称（4个汉字及以上）、首页地址、域名（可多个）、域名证书（可多个），还有网站服务内容类别，可在以下列表中选择一项
   * 综合门户
   * 搜索引擎
   * 单位门户网站
   * 网络游戏
   * 网络广告
5. 绑定独立域名所需的信息，参考上节文档  

#####第二步：

请提供您的地址，我们的备案接入商来给您邮寄幕布，因为幕布数量的关系，这里可能需要排队。
以下资料是需要您准备好邮寄给接入商

1.  企业营业执照副本复印件，盖公章
2.  企业法人身份证复印件，盖公章
3.  网站负责人身份证复印件，盖公章（如果和企业法人是同一人的话，此条可忽略）
4. 《网站备案信息真实性核验单》在最下面一栏，请网站负责人签字并盖公章。上面主办者名称和域名都需打印出来手写

备案接入商地址：  
> 地址：北京市东城区和平里东街15号航天物资大厦209房间  
> 备案专员：孟南  
> 联系电话：010-84222290转8001；18101125625  
  
#####第三步：

由我们和备案接入商来完成。

备案完成后，我们再执行绑定操作。


### 下载Web Hosting项目框架

进入 云代码 -> 设置 菜单下载项目框架（web主机版）：

![image](images/cloud_code_skeleton.png)

下载后的代码结构类似Cloud code（基本版），只是在`Cloud`目录下多了`app.js`文件和`views`目录:

```
<appName>
├── README.md
├── cloud
│   ├── app.js
│   ├── main.js
│   └── views
│       └── hello.ejs
├── config
│   └── global.json
└── public
    └── index.html
```


并且`cloud/main.js`里还多了一行代码：

```javascript
require('cloud/app.js');
```

用来加载app.js

代码部署的过程跟Cloud code部署是一样的，具体见[上面的章节](#%E9%83%A8%E7%BD%B2%E4%BB%A3%E7%A0%81)。


