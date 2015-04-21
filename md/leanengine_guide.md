# LeanEngine 指南

## 介绍

之前 LeanCloud 的[云代码](../cloud_code_guide.html)可以支持用户将自己的代码上传至我们的服务器上，来做一些自定义逻辑，以及拦截数据存储的 API 请求，做自定义的操作，以及 web hosting 功能，架设自己的网站。

现在我们将云代码的功能做了升级，开放性更高，并且更名为「LeanEngine」。老的云代码产品将继续运行并且维护下去，但是云代码上的功能都可以在 LeanEngine 实现，并且自由度更高，因此我们强烈建议您将您的项目改为 LeanEngine 实现。

### 与云代码的区别

* 多语言支持，目前支持 Node.js 与 Python，将来会支持更多的编程语言运行环境。
* 标准的运行环境，之前云代码是我们订制的一个沙箱运行环境，功能受限，并且代码只可以在云代码环境运行，难以迁移到自己搭建的后段服务器上。

## 创建项目

### node.js

首先请安装好 [node.js](https://nodejs.org/) 与 [npm](https://www.npmjs.com/)。

**注意**： 目前 LeanEngine 的 node.js 版本为 0.12，请您最好使用此版本的 node.js 进行开发，至少不要低于 0.10 。

创建一个叫做 `HelloLeanEngine` 的文件夹，作为项目的根目录。

在 `HelloLeanEngine` 目录中执行 `npm init`，接下来跟随 `npm` 向导，其中 `entry point` 请填入 `server.js`，其他根据您的情况自行选择（也可以全部选择默认值）。

接下来您的项目根目录下应该有了一个 `package.json` 文件。LeanEngine 是根据此文件来判断该项目的运行时语言为 node.js 的。

在项目根目录下执行 `npm install express --save`，这样会将 `express` 模块安装到当前目录，并且将依赖写入进 `package.json`，您的代码中就可以使用 `express` 了。

创建一个 `server.js` 的文件。这个文件将作为入口文件被 LeanEngine 执行。将下面内容填入 `server.js`：

```js
var express = require('express');

var app = express();

app.get('/', function(req, res) {
  res.send('hello world!');
});

app.get('/1/ping', function(req, res) {
  res.send('pong');
});

app.listen(parseInt(process.env.LC_APP_PORT || 3000, 10));
```

**注意**： `/1/ping` 这个页面的请求是必须的，LeanEngine 会定期去访问您的项目的此地址，检测项目可用性。

#### 本地运行

在项目根目录中执行 `npm start`，打开浏览器，访问 [http://localhost:3000/]() 即可访问您的项目。

#### 其他框架

LeanEngine 支持任意 node.js 的 web 框架，您可以使用您最熟悉的框架进行开发，或者不使用任何框架，直接使用 node.js 的 http 模块进行开发。但是请保证通过执行 `server.js` 能够启动您的项目，启动之后程序监听的端口为 `process.env.LC_APP_PORT`。

### Python

首先请安装好 [python](https://www.python.org/) 与 [pip](https://pip.pypa.io/)。

**注意**： 目前 LeanEngine 的 Python 版本为 2.7，请您最好使用此版本的 Python 进行开发。Python 3 的支持正在开发中。

创建一个叫做 `HelloLeanEngine` 的文件夹，作为项目的根目录。

在您的项目根目录创建一个 requirements.txt 的文件，填入以下内容：

```
flask
```

在项目根目录执行 `pip install -r requirements.txt`。这样即可将 flask 安装至系统。

**注意**： 推荐您使用 [virtualenv](https://virtualenv.pypa.io) 来将当前项目的第三方依赖与系统全局依赖做隔离，防止不同项目之间依赖的版本冲突。

创建 `app.py`：

```python
# coding: utf-8

from flask import Flask

app = Flask(__name__)


@app.route('/')
def index():
    return 'Hello, World!'


@app.route('/1/ping')
def ping():
    return 'pong'
```

**注意**： `/1/ping` 这个页面的请求是必须的，LeanEngine 会定期去访问您的项目的此地址，检测项目可用性。

创建 `wsgi.py`：

```python
# coding: utf-8

from wsgiref import simple_server

from app import app

application = app


if __name__ == '__main__':
	server = simple_server.make_server('localhost', 8000, application)
	server.serve_forever()
```

#### 本地运行

在您的项目根目录执行 `python wsgi.py`，访问 [http://localhost:3000/]() 即可访问您的项目。

#### 使用其他框架

LeanEngine 支持任意 python 的 web 框架，您可以使用您最熟悉的框架进行开发。但是请保证 `wsgi.py` 文件中有一个全局变量 `application`，值为一个 wsgi 函数。

## 部署