# iOS / OS X SDK 常见问题和解答


## 怎么使用 LeanCloud iOS SDK
最简单的方式，使用 CocoaPods，在 PodFile 加入以下内容：

```sh
pod 'AVOSCloud'
```

AVOSCloudSNS SDK：

```sh
pod 'AVOSCloudSNS'
```

### 如何使用「用户登录」功能

```objc
    [AVUser logInWithUsernameInBackground:@"zeng" password:@"123456" block:^(AVUser *user, NSError *error) {
        if (user != null) {
            NSLog(@"login success");
        } else {
            NSLog(@"signin failed");
        }
    }];

```

## 如何登出

```objc
[AVUser logOut];

```

## 如何使用「新浪微博」登录


```objc
[AVOSCloudSNS loginWithCallback:^(id object, NSError *error) {

  //回调代码

} toPlatform:AVOSCloudSNSSinaWeibo];

```

## 使用 AVOSCloudSNS，运行时报错：+[AVUser loginWithAuthData:block:]: unrecognized selector sent to class

请将 **Build Settings** -> **Linking** -> **Other Linker Flags** 设置为 **-ObjC**。具体原因可以参考苹果官方文档《Technical Q&A QA1490 [Building Objective-C static libraries with categories](https://developer.apple.com/library/mac/qa/qa1490/_index.html)》。此外，stackoverfow 上也有一个比较详细的答案：《[Objective-C categories in static library](http://stackoverflow.com/questions/2567498/objective-c-categories-in-static-library)》。









