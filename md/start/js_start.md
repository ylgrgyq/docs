把下面这行代码加入你的测试页面中：

```
<script src="https://leancloud.cn/scripts/lib/av-{{sdkversion.javascript}}.min.js"></script>
```

进行代码初始化，加入这行代码后，就可以创建 class 或任何其他操作了。

```
AV.initialize("{{app_id}}", "{{app_key}}");
// 初始化 param1：应用 id、param2：应用 key
```

创建应用后，可以在 [控制台 - 应用设置](/app.html?appid={{app_id}}#/key) 里面找到应用对应的 id 和 key。

开始测试。初始化后加入下面代码：

```
var TestObject = AV.Object.extend("TestObject");
var testObject = new TestObject();
testObject.save({foo: "bar"}, {
  success: function(object) {
  alert("LeanCloud works!");
  }
});
```
大功告成，访问 [控制台 - 数据管理](/data.html?appid={{app_id}}#/TestObject) 可以看到上面创建的 TestObject 的相关数据。

如果你希望在 [Node.js](http://nodejs.org/) 环境使用 JavaScript SDK 也可以，在 package.json 引用 SDK：

```
"avoscloud-sdk":"latest"
```

然后代码中使用 SDK：

```
	var AV = require('avoscloud-sdk').AV;
	AV.initialize("{{app_id}}", "{{app_key}}");
```
