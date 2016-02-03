# 云引擎服务总览

## 创建项目
在本地创建项目需要使用 LeanCloud 官方命令行工具，详细请查阅：[云引擎命令行工具使用详解](cloud_code_commandline.html)

请确保您已经在本地机器上可以成功运行命令行工具。

### 默认项目
使用命令行工具创建的项目模板是一个空项目，它的结构如下：


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


### 从项目模板创建

从 Github 迁出实例项目，该项目可以作为一个你应用的基础：

```
$ git clone https://github.com/leancloud/node-js-getting-started.git
$ cd node-js-getting-started
```

然后添加应用 appId 等信息到该项目：

```
$ avoscloud add <appName> <appId>
```


## 本地运行

首先在当前项目的目录下安装必要的依赖，执行如下命令行：

```
$ npm install
```

然后启动应用：

```
$ avoscloud
```


窗口会提示输入 Master Key，该信息可以在 [控制台 / 设置 / 应用 Key](/app.html?appid=#/key) 中找到。

<div class="callout callout-info">复制粘贴 Master Key 后，窗口不会有任何显示，直接按回车键确认即可。</div>

应用即可启动运行：<http://localhost:3000>

### 新建一个 Todo
用浏览器打开:<http://localhost:3000/todos>

然后在输入框输入：点个外卖

然后打开控制台，选择对应的应用，可以看到，在 Todo 表中会有一个新的记录，它的 `content` 列的值就是刚才输入的「点个外卖」。

详细的实现细节请阅读源代码，里面有完整的代码以及注释帮助开发者理解如何在 LeanEngine 上编写符合自己项目需求的代码。

## 部署到云端

部署到预备环境：

```
$ avoscloud deploy
```

如果你设置了 [二级域名](#设置域名)，即可通过 `http://stg-${your_app_domain}.leanapp.cn` 访问你应用的预备环境。

部署到生产环境：

```
$ avoscloud publish
```

如果你设置了 [二级域名](#设置域名)，即可通过 `http://${your_app_domain}.leanapp.cn` 访问你应用的生产环境。

关于设置域名的详细解释请参看[设置域名](#设置域名)这一章节的详细内容。

## 线上调试
打开浏览器，直接访问 `http://${your_app_domain}.leanapp.cn` ，可以看看是否能访问到网站的首页，它的首页应该会打印如下内容：

```
LeanEngine

这是 LeanEngine 的示例应用

当前时间：Mon Feb 01 2016 18:23:36 GMT+0800 (CST)

一个简单的「TODO 列表」示例
```

访问页面实际上就是在访问代码 `./app.js` 中的 默认路由：

```js
app.get('/', function(req, res) {
  res.render('index', { currentTime: new Date() });
});
```
对照代码，查看页面显示的内容是否与代码一致。

## 测试与发布
首先我们需要介绍 LeanEngine 的不同环境的概念。

### 预备环境和开发环境

因此，我们其实为每个应用创建了两个域名，除了 `${your_app_domain}.leanapp.cn` 之外，每个应用还有 `stg-${your_app_domain}.leanapp.cn` 域名作为预备环境的域名。

部署的测试代码将运行在这个域名之上，在测试通过之后，通过菜单 **部署** > **部署到生产环境** 按钮切换之后，可以在 `${your_app_domain}.leanapp.cn` 看到最新的运行结果。

### 环境变量
你可以在代码中使用以下与 LeanEngine 平台相关的环境变量：

变量名|说明
---|---
LC_APP_ID|当前应用的 App Id
LC_APP_KEY|当前应用的 App Key
LC_APP_MASTER_KEY|当前应用的 Master Key
LC_APP_ENV|当前的应用环境：<ul><li>开发环境没有该环境变量，或值为 `development`（一般指本地开发）</li><li>预备环境值为 `stage`</li><li>生产环境值为 `production`</li></ul>
LC_APP_PORT|当前应用开放给外网的端口，只有监听此端口，用户才可以访问到你的服务。

环境变量的作用是相当于预置了一些常量，方便开发者在使用这些的 LeanEngine 内置参数的时候不用再从控制台复制粘贴到代码中。

