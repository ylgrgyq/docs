
{% extends "./sdk_setup.tmpl" %}

{% block language %}Android{% endblock %} 

{% block libs_tool_automatic %}

#### Gradle
Gradle 是 Google 官方推荐的构建 Android 程序的工具，使用 Android Studio 进行开发的时候，它会自动在新建的项目中包含一个自带的命令行工具 **gradlew**。我们推荐开发者使用这个自带的命令行工具，这是因为 Gradle 存在版本兼容的问题，很多开发者即使正确配置了 Gradle 脚本，但由于使用了最新版本或不兼容的 Gradle 版本而仍然无法成功加载依赖包。

##### Android Studio
使用 Android Studio 创建一个新的项目的时候，它的目录结构如下：

```
.
├── app                 // 应用源代码
    ├── ...
    ├── build.gradle    // 应用 Gradle 构建脚本
    ├── ...
├── build.gradle        // 项目 Gradle 构建脚本
├── YOUR-APP-NAME.iml   // YOUR-APP-NAME 为你的应用名称
├── gradle                   
└── settings.gradle      
```

首先打开 `./build.gradle` ，按照如下进行标准配置，请注意：这一步我们修改的是根目录下的 `build.gradle`:

```
buildscript {
    repositories {
        jcenter()
        //这里是 LeanCloud 的包仓库
        maven {
            url "http://mvn.leancloud.cn/nexus/content/repositories/releases"
        }

    }
    dependencies {
        classpath 'com.android.tools.build:gradle:1.0.0'
    }
}

allprojects {
    repositories {
        jcenter()
        //这里是 LeanCloud 的包仓库
        maven {
            url "http://mvn.leancloud.cn/nexus/content/repositories/releases"
        }
    }
}
```

然后打开 `./app/build.gradle`，按照如下进行标准配置，请注意：这一步我们修改的是 `app` 目录下的 `build.gradle` :

```
android {
    //为了解决部分第三方库重复打包了META-INF的问题
    packagingOptions{
        exclude 'META-INF/LICENSE.txt'
        exclude 'META-INF/NOTICE.txt'
    }
    lintOptions {
        abortOnError false
    }
}

dependencies {
    compile 'com.android.support:support-v4:21.0.3'

    //avoscloud-sdk 为 LeanCloud基础包
    compile 'cn.leancloud.android:avoscloud-sdk:v3.+'

    //avoscloud-push 与 Java-WebSocket 为推送与IM需要的包
    compile 'cn.leancloud.android:avoscloud-push:v3.+@aar'
    compile 'cn.leancloud.android:Java-WebSocket:1.2.0-leancloud'

    //avoscloud-statistics 为 LeanCloud 统计包
    compile 'cn.leancloud.android:avoscloud-statistics:v3.+'

    //avoscloud-feedback 为 LeanCloud 用户反馈包
    compile 'cn.leancloud.android:avoscloud-feedback:v3.+@aar'

    //avoscloud-sns 为 LeanCloud 第三方登录包
    compile 'cn.leancloud.android:avoscloud-sns:v3.+@aar'
    compile 'cn.leancloud.android:qq-sdk:1.6.1-leancloud'

    //avoscloud-search 为 LeanCloud 应用内搜索包
    compile 'cn.leancloud.android:avoscloud-search:v3.+@aar'    
}
```

我们已经提供了官方的 [maven 仓库](http://mvn.leancloud.cn/nexus/)，推荐大家使用。

#### Eclipse 
Eclipse 用户首先 [下载 SDK](sdk_down.html)，然后按照 [手动安装步骤](#手动安装) 将 SDK 导入到项目里。

{% endblock %}

{% block sdk_download_link %}[SDK下载](sdk_down.html){% endblock %}

{% block import_sdk %}

下载成功之后将获得如下几个 lib 包:

```
├── avoscloud-feedback-{version-number}.zip     // LeanCloud 用户反馈模块
├── avoscloud-push-{version-number}.jar         // LeanCloud 推送模块和实时聊天模块
├── avoscloud-sdk-{version-number}.jar          // LeanCloud 基本存储模块
├── avoscloud-search-{version-number}.zip       // LeanCloud 应用内搜索模块
├── avoscloud-sns-{version-number}.zip          // LeanCloud SNS 模块
├── avoscloud-statistics-{version-number}.jar   // LeanCloud 统计模块
├── fastjson.jar                                // LeanCloud 基本存储模块
├── httpmime-4.2.4.jar                          // LeanCloud 基本存储模块
├── Java-WebSocket-1.2.0-leancloud.jar          // LeanCloud 推送模块和实时聊天模块
├── okhttp-2.5.0.jar                            // LeanCloud 基本存储模块
├── okio-1.6.0.jar                              // LeanCloud 基本存储模块
├── qq.sdk.1.6.1.jar                            // LeanCloud SNS 模块
└── weibo.sdk.android.sso.3.0.1-leancloud.jar   // LeanCloud SNS 模块
```

根据上述包及其对应的功能模块，开发者可以根据需求自行导入对应的模块。

##### LeanCloud 基本存储模块

* avoscloud-<版本号>.jar
* okhttp-2.5.0.jar
* okio-1.6.0.jar
* fastjson.jar (请一定要使用我们提供的 jar，针对原版有 bug 修正。)
* httpmime-4.2.4.jar

##### LeanCloud 推送模块和实时聊天模块

* LeanCloud 基础存储模块
* avospush-<版本号>.jar
* Java-WebSocket-1.2.0-leancloud.jar

##### LeanCloud 统计模块

* LeanCloud 基础存储模块
* avosstatistics-<版本号>.jar

##### LeanCloud SNS 模块

* LeanCloud 基础存储模块
* weibo.sdk.android.sso.jar
* qq.sdk.1.6.1.jar

我们提供的下载包里包含了必须的依赖库，请务必使用我们提供的 jar 包，才能保证 SDK 的正常运行。特别是 fastjson 必须使用我们提供的版本，否则无法运行。

**注意：如果需要使用美国站点，并且 SDK 版本是 3.3 及以上，则不需要引入 SSL 证书。其他低版本的用户，需要下载 [SSL 证书](https://download.leancloud.cn/sdk/android/current/avoscloud_us_ssl.bks)，将其拷贝到项目的 `res/raw/` 之下。**

#### Android Studio 
首先本地已经下载好了项目需要的 SDK 包，然后按照以下步骤导入：

1. 打开 **File** > **Project Structure** > **Modules** 对话框，点击 **Dependencies**；
2. 点击下方的**小 + 号**，选择要导入的 SDK 包（xxxx.jar），记得 **Scope** 选为 **Compile**；
3. 重复第 2 步，直到所有需要的包均已正确导入。

Eclipse 的导入与一般的 jar 导入无本质区别，不做赘述。

{% endblock %}

{% block init_with_app_keys %}

然后新建一个 Java Class ，名字叫做 **MyLeanCloudApp**,让它继承自 **Application** 类，实例代码如下:

```
public class MyLeanCloudApp extends Application {

    @Override
    public void onCreate() {
        super.onCreate();

        // 初始化参数依次为 this, AppId, AppKey
        AVOSCloud.initialize(this,"{{appid}}","{{appkey}}");
    }
}
```
将上述代码中的 App ID 以及 App Key 替换成从控制台复制粘贴的对应的数据即可。

然后打开 `AndroidManifest.xml` 文件来配置 SDK 所需要的手机的访问权限以及声明刚才我们创建的 `MyLeanCloudApp` 类：

```
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />

<application ...
  android:name=".MyLeanCloudApp"
  ... />
```

{% endblock %}

{% block sdk_using_north_america_node %}
只要在调用 `AVOSCloud.initialize` 之后调用一下 `AVOSCloud.useAVCloudUS()` 即可，如下： 

```java
public class MyLeanCloudApp extends Application {

    @Override
    public void onCreate() {
        super.onCreate();

        // 初始化参数依次为 this, AppId, AppKey
        AVOSCloud.initialize(this,"{{appid}}","{{appkey}}");
        // 启用北美节点
        AVOSCloud.useAVCloudUS();
    }
}

```

{% endblock %}

{% block save_a_hello_world %}
在 `MainActivity.java` 中的 `onCreate` 方法添加如下代码：

```java
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        ...
        // 测试 SDK 是否正常工作的代码
        AVObject testObject = new AVObject("TestObject");
        testObject.put("words","Hello,World!");
        testObject.saveInBackground(new SaveCallback() {
            @Override
            public void done(AVException e) {
                if(e == null){
                    Log.d("saved","success!");
                }
            }
        });
        
        ...

    }
```

然后，点击 `Run` 运行调试，真机和虚拟机均可。
{% endblock %}

{% block permission_access_network_config %}{% endblock %}

{% block platform_specific_faq %}{% endblock %}


