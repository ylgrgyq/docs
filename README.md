# LeanCloud Documentation

LeanCloud 开发者文档

## 说明

这个项目是 LeanCloud [文档](http://leancloud.cn/docs/)上的所有文档的 Markdown 格式的源码，最终将渲染成你在网站上看到的 [HTML 文档](http://leancloud.cn/docs/)。

因此 Markdown 文件里部分链接写的是最终渲染后的链接，如果直接点击会发现 404 错误。敬请谅解。

## 安装

* `npm install` 安装依赖

## 预览

* `grunt server` 本地启动一个 HTTP Server（localhost:3000），然后打开浏览器访问即可，（更改文档后无需刷新页面）

## 贡献

我们欢迎所有用户为我们贡献或者修正错误。您只要 [fork](https://github.com/leancloud/docs/fork) 这个项目，并提交 [Pull Request](https://github.com/leancloud/docs/pulls) 即可。

## 注意事项

* 所有 `.md` 格式文档需要更新到 `md` 目录下
* 更新文档只需要修改或创建相应的 `.md` 文件，然后提交 Pull Request 即可
* 由于文档会采用 AngularJS 渲染，当文档中需要显示 `{{content}}` 这种格式时，外面需要加上 `<span ng-non-bindable></span>`，以不被 AngularJS 渲染
* 图片资源放在当前 repo 的 `images` 文件夹下，引用方式类似 `![image](images/cloud_code_menu.png)`

## LeanCloud 内部员工发布新文档

* 自己修改的文档，自己负责检查和发布
* 通过 Jenkins 执行 `cn-avoscloud-docs-prod-ucloud` 任务发布即可

## 协议

[GNU LGPL](https://www.gnu.org/licenses/lgpl.html)
