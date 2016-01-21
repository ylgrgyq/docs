
{% extends "./sdk_setup.tmpl" %}

{% block language %}iOS / OS X{% endblock %} 

{% block libs_tool_automatic %}

#### CocoaPods
[CocoaPods](http://www.cocoapods.org/) 是开发 OS X 和 iOS 应用程序的一个第三方库的依赖管理工具。利用 [CocoaPods](http://www.cocoapods.org/)，可以定义自己的依赖关系 (称作 pods)，并且随着时间的推移，它会让整个开发环境中对第三方库的版本管理变得非常方便。

首先确保开发环境中已经安装了 Ruby（一般安装了 XCode，Ruby 会被自动安装上），如果没有安装请执行以下命令行：

```sh
$ sudo gem install cocoapods
```

如果遇到网络问题无法从国外主站上直接下载，我们推荐一个国内的镜像：[RubyGems 镜像](http://ruby.taobao.org/)，具体操作步骤如下：

```sh
$ gem sources --remove https://rubygems.org/
$ gem sources -a https://ruby.taobao.org/
# 请确保下列命令的输出只有 ruby.taobao.org
$ gem sources -l
*** CURRENT SOURCES ***
https://ruby.taobao.org
```

然后再安装 CocoaPods，

```sh
$ sudo gem install cocoapods
```

在项目根目录下创建一个名为 `Podfile` 的文件（无扩展名），并添加以下内容：

  ```sh
  pod 'AVOSCloud'//数据存储，短信等基础服务模块
  pod 'AVOSCloudIM'//实时通信模块
  // 根据实际需要选择引入的 SDK 模块
  ```

执行命令 `pod install --verbose` 安装 SDK。如果本地安装过 SDK，则可执行 `pod install --verbose --no-repo-update` 来加快安装速度。

相关资料：《[CocoaPods 安装和使用教程](http://code4app.com/article/cocoapods-install-usage)》

{% endblock %}

{% block sdk_download_link %}[SDK 下载](sdk_down.html){% endblock %}

{% block import_sdk %}

下载并解压成功之后将获得如下几个压缩包:

```
├── AVOSCloud.zip                  // LeanCloud 核心组件，包含数据存储，推送，统计等
├── AVOSCloudIM.zip                // LeanCloud 实时消息模块                          
└── AVOSCloudCrashReporting.zip    // LeanCloud 崩溃报告
```
根据上述包及其对应的功能模块，开发者可以根据需求自行导入对应的模块。

手动导入项目的过程请参考[快速入门](/start.html) 。

这里要特别注意如下几点：

* 手动添加下列依赖库：
  * SystemConfiguration.framework
  * MobileCoreServices.framework
  * CoreTelephony.framework
  * CoreLocation.framework
  * libicucore.dylib

* 如果使用 [崩溃报告 AVOSCloudCrashReporting](./ios_crashreporting_guide.html)，还需额外添加 **libc++.dylib**。

* 在 Target 的 **Build Settings** 中，为 **Other Linker Flags** 增加：
  * `-lz`
  * `-licucore`
  * `-ObjC`
  * `-lc++` （Crash Reporting 模块需要）
  * `-lsqlite3` （IM 模块需要）

{% endblock %}

{% block init_with_app_keys %}

打开 `AppDelegate.m` 文件，添加下列导入语句到头部：

```
#import <AVOSCloud/AVOSCloud.h>;
//如果使用了实时通信模块，请添加下列导入语句到头部：
#import <AVOSCloudIM.h>
```

如果是使用 Swift 语言开发，直接包含 AVOSCloud 模块：

```swift
import AVOSCloud
//如果使用了实时通信模块，请添加下列导入语句到头部：
import AVOSCloudIM
```

然后粘贴下列代码到 `application:didFinishLaunchingWithOptions` 函数内：

```objc
// applicationId 即 App Id，clientKey 是 App Key。
[AVOSCloud setApplicationId:@"{{appid}}"
              clientKey:@"{{appkey}}"];
```

如果想跟踪统计应用的打开情况，后面还可以添加下列代码：

```objc
[AVAnalytics trackAppOpenedWithLaunchOptions:launchOptions];
```

{% endblock %}

{% block sdk_using_north_america_node %}

```
// applicationId 即 App Id，clientKey 是 App Key。
[AVOSCloud setApplicationId:@"{{appid}}"
              clientKey:@"{{appkey}}"];
//如果使用美国站点，请加上这行代码 
[AVOSCloud useAVCloudUS];
```
{% endblock %}

{% block save_a_hello_world %}

```
AVObject *post = [AVObject objectWithClassName:@"TestObject"];
[post setObject:@"Hello World!" forKey:@"words"];
[post saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
    if (succeeded) {
      // 保存成功了！
    }
}];
```

然后，点击 `Run` 运行调试，真机和虚拟机均可。
{% endblock %}

{% block permission_access_network_config %}{% endblock %}

{% block platform_specific_faq %}{% endblock %}


