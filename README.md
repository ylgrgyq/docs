# LeanCloud Documentation

LeanCloud 开发者文档

## 说明

这个项目是 LeanCloud [文档](http://leancloud.cn/docs/)上的所有文档的 Markdown 格式的源码，最终将渲染成你在网站上看到的 [HTML 文档](http://leancloud.cn/docs/)。

因此 Markdown 文件里部分链接写的是最终渲染后的链接，如果直接点击会发现 404 错误。敬请谅解。

## 贡献

我们欢迎所有用户为我们贡献或者修正错误。您只要 [fork](https://github.com/leancloud/docs/fork) 这个项目，并提交 [Pull Request](https://github.com/leancloud/docs/pulls) 即可。

我们所有文档的源文件都在 `/md` 目录中（内容使用 Markdown 语法），相关图片放在 `/images` 目录下。

LeanCloud 衷心感谢您的贡献。

## 预览

开发服务基于 Grunt，所以需要有 Nodejs 环境，通过 NPM 安装测试需要的依赖

安装 Grunt

```bash
$ sudo npm install -g grunt-cli
```

安装需要的依赖

```bash
$ npm install
```

本地启动一个 HTTP Server，然后打开浏览器访问 http://localhost:3000 即可

```bash
$ grunt server
```

## 注意事项

* 所有 `.md` 格式文档需要更新到 `/md` 目录下
* 更新文档只需要修改或创建相应的 `.md` 文件，然后提交 Pull Request 即可
* 由于文档会采用 AngularJS 渲染，当文档中需要显示 `{{content}}` 这种格式时，外面需要加上 `<span ng-non-bindable></span>`，以不被 AngularJS 渲染
* 图片资源放在当前 repo 的 `/images` 文件夹下，引用方式类似 `![image](images/cloud_code_menu.png)`
* 当增加一个全新的文档，需要更新文档首页 `templates/pages/index.html`，顶部菜单 `templates/include/header.html`

### 一套模板多份渲染

有些文档的相似度非常高，多以可以使用一份模板，多分变量渲染的方式一次性生成多份文档，比如 「LeanEngine 指南」的文档就是这样生成的。这份文档分为三个运行时：Node.js、Python、云代码 2.0。最终效果可见 [LeanEngine (Node.js 环境)](https://leancloud.cn/docs/leanengine_guide-node.html) 和 [LeanEngine（Python 环境）](https://leancloud.cn/docs/leanengine_guide-python.html)。这类文档编写方式如下：

* 在 `views` 目录先编写一份「模板」（以 `tmpl` 作为扩展名），将文档的主体部分完成，将文档之间不一样的部分（比如不同语言的代码片段）使用：

  ```
  {% block <blockName> %}{% endblock %}
  ```

  括起来。可以参考 [leanengine_guide.tmpl](https://github.com/leancloud/docs/blob/master/views/leanengine_guide.tmpl)。
* 在 `views ` 目录里编写多份渲染变量（以 `md` 作为文件扩展名）。第一行表明自己继承哪个模板：

  ```
  {% extends "./<your-tmpl-file>" %}
  ```

  后续的内容就是用：
  
  ```
  {% block <blockName> %}<不同文档之间的差异>{% endblock%}
  ```
  
  来替换模板中存在的 block。可以参考 [leanengine_guide-node.tmpl](https://github.com/leancloud/docs/blob/master/views/leanengine_guide-node.md)
* 生成文档：使用下列命令会在 md 文件夹中生成最终的 md 文件：

  ```
  grunt nunjucks
  ```

  同样支持 `grunt server` 命令，该命令最终会执行 `watch` 插件，此时修改模板文件，或者变量文件都会自动重新生成最终的 md 文件（可能需要等待 2~4 秒）。
* 记得将这种方式生成的 md 文件添加到 [.gitignore](https://github.com/leancloud/docs/blob/master/.gitignore) 文件中，确保这类文件不会被提交。

**注意：如果在模板中需要渲染 `{{appid}}` 这样的 AngularJS 变量，则必须在模板文件的最上方先定义好一个新变量，如 `appid`，其值为 `'{{appid}}'`，例如：**

```
{% set appid = '{{appid}}' %}
{% set appkey = '{{appkey}}' %}
{% set masterkey = '{{masterkey}}' %}
```
这样，在生成的 html 文档中，`{{appid}}` 才可以被正确渲染，否则，它会被替换为空值，原因是 nunjucks 在上下文中找不到该变量的定义。

## LeanCloud 内部员工发布新文档

* 自己修改的文档，自己负责检查和发布
* 通过 Jenkins 执行 `cn-avoscloud-docs-prod-ucloud` 任务发布即可

## 协议

[LGPL](https://www.gnu.org/licenses/lgpl.html)
