# LeanCloud Documentation

LeanCloud 开发者文档

## 说明

这个项目是 LeanCloud [文档](http://leancloud.cn/docs/)上的所有文档的 Markdown 格式的源码，最终将渲染成你在网站上看到的 [HTML 文档](http://leancloud.cn/docs/)。

因此 Markdown 文件里部分链接写的是最终渲染后的链接，如果直接点击会发现 404 错误。敬请谅解。

## 贡献

我们欢迎所有用户为我们贡献或者修正错误。您只要 [fork](https://github.com/leancloud/docs/fork) 这个项目，并提交 [Pull Request](https://github.com/leancloud/docs/pulls) 即可。

## 协议

[GNU LGPL](https://www.gnu.org/licenses/lgpl.html)

## 注意事项
* 更新文档只需要修改或创建相应的 `MD` 文件，然后提 PullRequest 即可。
* 如果新建一个文件，需要从 # 一级标题开始 ,如果两个标题间没有任何文字，需要用两个以上空行来间隔。
* 由于文档会采用 Angular 渲染，当文档中需要显示 `{{content}}` 这种格式时，外面需要加上 `<span ng-non-bindable></span>`，以不被 Angular 渲染。
* 标题等级要保持连续性，比如 `# 一级标题   ### 三级标题` 这样是不对的。
* 如果变动比较大，需要本地先预览下看下效果，可以 [运行这个项目](https://github.com/leancloud/avoscloud-docs)。

## LeanCloud 内部员工发布新文档
* 自己修改的文档，自己负责检查和发布。
* 通过 jenkins 执行 cn-avoscloud-docs-prod-ucloud 任务发布即可。
