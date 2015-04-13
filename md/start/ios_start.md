#### 自动安装

[CocoaPods](http://www.cocoapods.org) 是一个很好的依赖管理工具，我们推荐您使用这个方法来安装 SDK，最大化的简化安装过程。

在 Podfile 中添加：

```
pod 'AVOSCloud'
```

如果需要 UI 的相关功能，可以添加：

```
pod 'AVOSCloudUI'
```

如果社交组件的相关功能，可以添加：

```
pod 'AVOSCloudSNS'
```

也可以通过测试版的 Podspec 来使用我们几乎每天都会更新的开发中的 SDK：

```
pod 'AVOSCloud', :podspec => 'https://download.leancloud.cn/sdk/iOS/release-beta/AVOSCloud.podspec'
pod 'AVOSCloudSNS', :podspec => 'https://download.leancloud.cn/sdk/iOS/release-beta/AVOSCloudSNS.podspec'
```
不过 AVOSCloudUI 仍然建议使用稳定版

```
pod 'AVOSCloudUI'

```

#### 手动安装

您也可以从下面的地址下载最新版本 iOS 的 SDK：

<p><a class="btn btn-default" href="https://leancloud.cn/docs/sdk_down.html">下载 iOS SDK</a></p>

下载 SDK，解压缩下载的文件，并拖拽 `AVOSCloud.framework` 目录到你的 Xcode 项目目录的 target 下：

<div class="callout callout-info">确保你正在使用最新版本的 Xcode（4.6+），并且面向 iOS 4.3 或者更高版本。我们推荐 Xcode 5 和 iOS 5 或以上系统。</div>

![img](https://leancloud.cn/docs/images/quick_start/ios/1.png)

确保 **Copy items to destination's group folder** 选择框处于选中状态。

![img](https://leancloud.cn/docs/images/quick_start/ios/2.png)

做完上面这些步骤后，看起来是这样：

![img](https://leancloud.cn/docs/images/quick_start/ios/3.png)

点击 **Targets** - **你的 App 名称** - **Build Phases** 标签卡，展开 **Link Binary With Libraries** 可以看到：

![img](https://leancloud.cn/docs/images/quick_start/ios/4.png)

点击 **Link Binary With Libraries** 部分左下角的加号按钮：

![img](https://leancloud.cn/docs/images/quick_start/ios/6.png)

添加下列库：

- `SystemConfiguration.framework`
- `MobileCoreServices.framework`
- `CoreTelephony.framework`
- `CoreLocation.framework`
- `libicucore.dylib`

如果使用 `AVOSCloudUI` ，还需额外添加 `CFNetwork.framework`


打开 `AppDelegate.m` 文件，添加下列导入语句到头部：

```
#import <AVOSCloud/AVOSCloud.h>;
```

然后粘贴下列代码到 `application:didFinishLaunchingWithOptions` 函数内：

```
//如果使用美国站点，请加上这行代码 [AVOSCloud useAVCloudUS];
[AVOSCloud setApplicationId:@"{{appid}}"
              clientKey:@"{{appkey}}"];
```

如果想跟踪统计应用的打开情况，后面还可以添加下列代码：

```
[AVAnalytics trackAppOpenedWithLaunchOptions:launchOptions];
```

创建应用后，可以在 [控制台 - 应用设置](/app.html?appid={{appid}}#/key) 里面找到应用对应的 id 和 key。

修改编译选项 **Architectures** 值为 `Standard architectures(armv7,armv7s)`：

![img](https://leancloud.cn/docs/images/quick_start/ios/arm64.png)

如果你的目标 iOS 版本小于 5.0，你需要添加 `-fobjc-arc` 标志到你的 target build settings 里的 **Other Linker Flags** 选项：

![img](https://leancloud.cn/docs/images/quick_start/ios/fobjc.gif)

保证在你的 `.h` 头文件里包含了 SDK 库文件：

```
#import <AVOSCloud/AVOSCloud.h>;
```

拷贝下面的代码到你的 app 里，比如在 `viewDidLoad` 方法（或者其他的你运行 app 将会调用到的方法）：

```
AVObject *testObject = [AVObject objectWithClassName:@"TestObject"];
[testObject setObject:@"bar" forKey:@"foo"];
[testObject save];
```

运行你的 app，一个类为 `TestObject` 的新对象将被发送到 LeanCloud 并保存下来。当你做完这一切，访问 [控制台 - 数据管理](/data.html?appid={{appid}}#/TestObject) 可以看到上面创建的 `TestObject` 的相关数据。
