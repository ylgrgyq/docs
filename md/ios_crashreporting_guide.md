# iOS 崩溃报告开发指南

崩溃报告可以让你收集到你不知情的情况下产生错误。你将可以看到你应用各种非正常崩溃的信息，包括完整的堆栈跟踪、设备信息和应用信息等。如果还没有安装 LeanCloud iOS SDK，请阅读 [快速入门](/start.html) 来获得该 SDK，并在 Xcode 中运行和熟悉示例代码。

## 开启

要开启崩溃报告功能，你需要添加 `AVOSCloudCrashReporting.framework` 到项目的依赖库列表。然后在 AppDelegate 的 LeanCloud SDK 初始化之前添加这些代码：

```objc
// Enable Crash Reporting
[AVOSCloudCrashReporting enable];

// Setup AVOSCloud
[AVOSCloud setApplicationId:@"{{appid}}" clientKey:@"{{appkey}}"];
```
只要开启了崩溃报告，你应用的崩溃信息将会发送到 LeanCloud 服务器，并且会在应用后台统计分析中列出来。

## 符号化
将你应用的每一个版本的符号文件发送到 LeanCloud 是非常重要的。这将使 LeanCLoud 后台能够正确解析崩溃堆栈信息，让你能够更加准确的定位问题。
上传符号文件有两种方式，每次构建应用时自动上传和手动上传。我们推荐使用自动上传，这样你不需要一直记着每次发布版本时要上传符号文件。
要每次构建应用时自动上传符号文件，你需要：

* 使用命令 `gem install --no-wrappers leancloud` 安装客户端工具
* 在应用的 target 添加一个 `Run Script` 步骤到 `Build Phases` 里：
```sh
leancloud upload_symbol \
-f "${DWARF_DSYM_FOLDER_PATH}/${DWARF_DSYM_FILE_NAME}" \
-i {{appid}} \
-k {{appkey}}
```

要手动上传符号文件，你可以使用使用命令：
```sh
leancloud upload_symbol \
-f "<dSYM/xcarchive/DWARF path>" \
-i {{appid}} \
-k {{appkey}}
```

你可以从这些位置寻找你的应用的符号文件，具体位置跟你的发布流程相关：

* 当你 "Archive" 你的应用时会得到一个 `xcarchive` 文件。你可以通过 Xcode Organizer 里面的 Archives 选项卡定位到文件位置。
* dSYM 文件是和你的应用同时产生的。它经常仅在使用 'Release' 或 'Archiving' 构建应用时出现。你可以在 Xcode DerivedData 文件夹下面你生成的 .app 同级的文件夹下面找到。
* DWARF 是最底层的也是我们支持最好的，它可以通过 strip 你生成的二进制文件得到
当你发布了一个版本却忘记上传符号文件的时候，可以使用手动上传。如果一个崩溃报告没有对应的符号文件，你会看到提示进行符号化。

## 测试
开启了崩溃报告之后，你可能想要测试你的崩溃信息是不是发送到了 LeanCloud 服务器。你可以在你的 view controller 或 AppDelegate 里面添加一个 crash 的方法：
```objc
- (void)crash {
    [NSException raise:NSGenericException format:@"Everything is ok. This is just a test crash."];
}
```
然后添加下面的调用代码到你的主 view controller 的 `viewDidLoad` 或 AppDelegate 的 `application:didFinishLaunchingWithOptions:` 方法里面：
```objc
[self performSelector:@selector(crash) withObject:nil afterDelay:5.0];
```
现在，按下面的步骤操作：

1. build，run，然后 stop 应用。
2. 不使用调试器开启应用，因为调试器开启时不会收集崩溃信息。最简单的方法就是在你 Home 界面点开应用。
3. 等待应用崩溃。
4. 再次运行应用。应用将在启动时自动发送崩溃报告到 LeanCloud 服务器。
现在，你可以在应用后台统计分析的错误分析里面看到查看刚才的崩溃信息。注意，崩溃信息可能需要延时几分钟显示。

## 流程
使用崩溃报告可以极大地改进你的应用质量，提升用户体验。我们推荐使用以下流程有效地修复应用崩溃问题：

1. 确认要修复的崩溃。

	后台的崩溃信息列表展示了应用的按发生次数排序的所有崩溃信息。通常你会想优先修复影响最大的崩溃。你可以点击每条崩溃记录得到更详细的信息，包括堆栈跟踪、系统版本、设备类型和受影响的应用版本等。
2. 修复崩溃。

	调试你的代码，修复崩溃问题。
3. 构建新的版本。
4. 标记已修复的崩溃，发布新版本到 App Store。

	标记为已修复的崩溃不会在默认的列表页出现。如果同样的崩溃在新版本中再次出现，这个崩溃将自动恢复成未修复状态，并且重新出现在默认列表里面。
5. 重复上面步骤，不断改进你的应用。

## 排错
1. 为什么我的崩溃没有在后台列表显示

	你的应用可能没有发送崩溃报告到 LeanCloud 服务器。你需要检查：
	* 确认你在 LeanCloud SDK 初始化之前开启了崩溃报告。
	* 如果你是测试崩溃报告，确认你的应用不是通过调试器开启的。你需要 build，run，stop 之后再在 home 界面点开应用。
	* 崩溃信息是在崩溃发生之后下次启动应用的时候发送的。确保应用不会在崩溃信息发送之前再次崩溃。如果是在测试崩溃报告，你可以添加一段延时来保证。
	* 确保你没有使用其它崩溃报告的库，这样会互相干扰。

2. 为什么我的崩溃没有符号化

	你可能没有上传对应版本的应用的符号文件。你需要检查：
	* 如果你设置的自动上传符号文件，切换到 Xcode 的 Report navigator （Command + 8）验证一下上传是否正常
	* 确认日志正常，上传过程没有错误
	* 如果你上传了一个符号文件对应之前没有符号化的崩溃，同一崩溃再次发生时会符号化，之前没有符号化的不会再符号化，所以你需要将之前的标记为已解决并等待再次发生。
	* 如果你使用了自定义的动态链接框架（dynamic framework），并且部分堆栈信息没有符号化，确认你上传了所有动态链接框架以及主应用的符号文件。
