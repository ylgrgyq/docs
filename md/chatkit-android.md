# ChatKit 使用指南 &middot; Android

[ChatKit](https://github.com/leancloud/LeanCloudIMKit-Android) 是由 LeanCloud 官方推出的、基于 LeanMessage（LeanCloud 实时通信 SDK）开发并封装了简单 UI 的聊天套件。它可以帮助开发者快速掌握 LeanMessage 的技术细节，轻松扩展和实现常用的聊天功能。

ChatKit 是一个免费且开源的项目组件，提供完全自由的授权协议，开发者可以对其进行任意的自定义和二次封装。
ChatKit 的底层依然是基于 LeanCloud 客户端的 SDK ，最大的特点是把聊天常用的一些功能配合 UI 一起提供给开发者。

## 获取项目

```bash
git clone git@github.com:leancloud/LeanCloudIMKit-Android.git
```

## 运行 Demo
获取源代码之后，用 [Android Studio](http://developer.android.com/tools/studio/index.html) 打开项目。

在左侧的 Project 视图，如下图所示：

![project_structure](http://ac-lhzo7z96.clouddn.com/1459410595962)

ChatKit-Android project 包含两个 module，leancloudimkit 与 chatkitapplication

  * leancloudimkit 是一个封装了 LeanCloud 实时通讯的 UI lib，其目的是可以让开发者更快速的接入 LeanCloud 实时通讯的功能。
  * imkitapplication 为 Demo 项目，它是一个简单的示例项目，用来指导开发者如何使用 leancloudimkit。

然后，请确保电脑上已经连接了一台真机或者虚拟机用作调试。

点击 **Debug** 或者 **Run**，第一次启动会运行 Gradle Build。建议打开全局网络代理，否则 Gradle Build 可能会因为「网络原因」无法完成。


## 使用 ChatKit

开发者可以在自己的 Project 中导入 ChatKit 并使用，这里为了详细说明，新建一个 Project 用以导入 ChatKit。
导入方式有三种，通过 Gradle 导入、通过源代码导入、通过 Jar 包导入（因为通过 Jar 包导入仍然要拷贝资源文件，所以这里不推荐此种方式）。


### 导入 ChatKit 
新建一个 application project，这里起名称为 ChatDemo
ChatDemo 根目录下的 build.gradle 标准配置为

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
			classpath 'com.android.tools.build:gradle:2.0.0'
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

#### 通过 Gradle 导入

修改 app 目录下的 build.gradle 文件，dependencies 中添加依赖，如下：

```
dependencies {
    compile ('cn.leancloud.android:chatkit:1.0.0')
}
```

#### 源代码导入（如果是通过 Gradle 导入则不需要以下步骤）

1. 浏览器访问 https://github.com/leancloud/ChatKit-Android
2. clone 项目到本地，命令行下执行：`git clone https://github.com/leancloud/LeanCloudChatKit-Android.git`（也可以直接下载 zip 包，假设本地目录为 `/Users/leancloud/workspace/chatKitImport/`）
3. 将 ChatKit 文件夹 copy 到 ChatDemo 根目录
4. 修改 ChatDemo/settings.gradle 加入 include ':ChatKit'
5. 修改 ChatDemo/app/build.gradle，在 dependencies 中添加 compile project(":ChatKit")

最后只要 sync project，这样 ChatKit 就算是导入进 project 了


### 自定义使用

1. 实现自己的 Application
ChatDemo 中新建一个 Java Class ，名字叫做 ChatDemoApplication，让它继承自 Application 类，实例代码如下:

```java
public class ChatDemoApplication extends Application {

// appId、appKey 可以在 LeanCloud  控制台 / 设置 / 应用 Key 下边获取
  private final String APP_ID = "********";
  private final String APP_KEY = "********";

  @Override
  public void onCreate() {
    super.onCreate();
    // 关于 CustomUserProvider 可以参看下边文档
    LCChatKit.getInstance().setProfileProvider(CustomUserProvider.getInstance());
    LCChatKit.getInstance().init(getApplicationContext(), APP_ID, APP_KEY);
  }
}
```

2. 在 AndroidMainfest.xml 中配置 ChatDemoApplication

```xml
<application
  ...
  android:name=".ChatDemoApplication" >
  ...
</application>
```

3. 实现自己的用户体系
ChatDemo 中新建一个 Java Class，名字叫做 CustomUserProvider
实例代码如下：


```java
public class CustomUserProvider implements LCChatProfileProvider {

  private static CustomUserProvider customUserProvider;

  public synchronized static CustomUserProvider getInstance() {
    if (null == customUserProvider) {
      customUserProvider = new CustomUserProvider();
    }
    return customUserProvider;
  }

  private CustomUserProvider() {
  }

  private static List<LCChatKitUser> partUsers = new ArrayList<LCChatKitUser>();

  // 此数据均为模拟数据，仅供参考
  static {
    partUsers.add(new LCChatKitUser("Tom", "Tom", "http://www.avatarsdb.com/avatars/tom_and_jerry2.jpg"));
    partUsers.add(new LCChatKitUser("Jerry", "Jerry", "http://www.avatarsdb.com/avatars/jerry.jpg"));
    partUsers.add(new LCChatKitUser("Harry", "Harry", "http://www.avatarsdb.com/avatars/young_harry.jpg"));
    partUsers.add(new LCChatKitUser("William", "William", "http://www.avatarsdb.com/avatars/william_shakespeare.jpg"));
    partUsers.add(new LCChatKitUser("Bob", "Bob", "http://www.avatarsdb.com/avatars/bath_bob.jpg"));
  }

  @Override
  public void fetchProfiles(List<String> list, LCChatProfilesCallBack callBack) {
    List<LCChatKitUser> userList = new ArrayList<LCChatKitUser>();
    for (String userId : list) {
      for (LCChatKitUser user : partUsers) {
        if (user.getUserId().equals(userId)) {
          userList.add(user);
          break;
        }
      }
    }
    callBack.done(userList, null);
  }

  public List<LCChatKitUser> getAllUsers() {
    return partUsers;
  }
}
```
4. 打开实时通讯，并且跳转到聊天页面

```java
LCChatKit.getInstance().open("Tom", new AVIMClientCallback() {
      @Override
      public void done(AVIMClient avimClient, AVIMException e) {
        if (null == e) {
          finish();
          Intent intent = new Intent(MainActivity.this, LCIMConversationActivity.class);
          intent.putExtra(LCIMConstants.PEER_ID, "Jerry");
          startActivity(intent);
        } else {
          Toast.makeText(MainActivity.this, e.toString(), Toast.LENGTH_SHORT).show();
        }
      }
    });
```
这样，Tom 就可以和 Jerry 愉快的聊天了。


## 接口以及组件
ChatKit 主要需要开发者关心 LCChatKit、LCChatKitUser、LCChatProfileProvider 这几个类，下边逐个说明其用途：

### 业务逻辑组件 - Interface
#### 用户 - LCChatKitUser
`LCChatKitUser` 是 ChatKit 封装的参与聊天的用户，它提供了如下属性：

名称 | 描述 |
--- | --- |
userId | 用户在单个应用内唯一的 ID |
avatarUrl | 用户的头像 |
name | 用户名

使用这些默认的属性基本可以满足一个聊天应用的需求，同时开发者可以通过继承 `LCChatKitUser` 类实现更多属性。

在 Demo 程序中的 `MembersAdapter.java` 有具体的用法参考。

#### 用户信息管理类- LCChatProfileProvider
此接口需要用户 implements 后实现 fetchProfiles 函数，以使 ChatKit 在需要显示的时候展示用户相关的信息。

例如，在 Demo 程序中的 `CustomUserProvider` 这个类，它实现了 `LCChatProfileProvider` 接口，在 `fetchProfiles` 方法里加载了 Tom,Jerry 等人的信息。
#### Core - LCChatKit
此类是 ChatKit 的核心类，具体逻辑可以参看代码，现解释一下几个主要函数：

1. public void init(Context context, String appId, String appKey) 
此函数用于初始化 ChatKit 的相关设置，此函数要在 Application 的 onCreate 中调用，否则可能会引起异常。

2. public void setProfileProvider(LCChatProfileProvider profileProvider)
此函数用于设置用户体系，因为 LeanCloud 实时通讯功能已经实现了完全剥离了用户体系的功能，这里接入已有的用户体系会很方便。

3. public void open(final String userId, final AVIMClientCallback callback)
此函数用于开始实时通讯，open 成功后，可以执行自己逻辑，或者跳转到聊天页面

### 界面组件 - UI
ChatKit 包含两个 UI 页面，LCIMConversationListFragment 与 LCIMConversationActivity

#### 对话列表界面 - LCIMConversationFragment
对话(`AVIMConversation`)是 LeanMessage 封装的管理对话人员以及发送消息的载体，不论是群聊还是单聊都是在一个对话当中。而对话列表可以作为聊天应用默认的首页显示出来，主流的社交聊天软件，例如微信的行为就是把最近的对话列表作为登录之后的首页。

因此，我们也提供了对话列表(`LCIMConversationListFragment`)的页面给开发者使用,在 Demo 项目中的 `MainActivity` 中的 `initTabLayout` 方法中演示了如何引入对话列表页面：

```java
  private void initTabLayout() {
    String[] tabList = new String[]{"会话", "联系人"};
    final Fragment[] fragmentList = new Fragment[] {new LCIMConversationListFragment(),
            new ContactFragment()};
    // 以上这段代码为新建了一个 Fragment数组，并且把 LCIMConversationListFragment 作为默认显示的第一个 Tab 页面

    tabLayout.setTabMode(TabLayout.MODE_FIXED);
    for (int i = 0; i < tabList.length; i++) {
      tabLayout.addTab(tabLayout.newTab().setText(tabList[i]));
    }
    ...
}
```
具体的显示效果如下：

![](https://dn-lhzo7z96.qbox.me/1464320206432)

#### 聊天界面 - LCIMConversationFragment & LCIMConversationActivity
聊天界面是显示频率最高的前端页面，在 ChatKit 当中自然也提供这一界面的实现。

在 Demo 项目中的 `ContactItemHolder` 界面中，有使用 `LCIMConversationActivity` 的实例。

```java
  public void initView() {
    nameView = (TextView)itemView.findViewById(R.id.tv_friend_name);
    avatarView = (ImageView)itemView.findViewById(R.id.img_friend_avatar);

    itemView.setOnClickListener(new View.OnClickListener() {
      @Override
      public void onClick(View v) {
        // 点击联系人，直接跳转进入聊天界面 
        Intent intent = new Intent(getContext(), LCIMConversationActivity.class);
        // 传入对方的 Id 即可
        intent.putExtra(LCIMConstants.PEER_ID, lcChatKitUser.getUserId());
        getContext().startActivity(intent);
      }
    });
  }
```
具体的显示效果如下：

![chatkit_01](https://dn-lhzo7z96.qbox.me/1461816927540)


## F&Q
Q：ChatKit 组件收费么？
A：ChatKit 是完全开源并且免费给开发者使用，使用聊天所产生的费用以账单为准。

Q：接入 ChatKit 有什么好处？
A：它可以减轻应用或者新功能研发初期的调研成本，直接引入使用即可。ChatKit 从底层到 UI 提供了一整套的聊天解决方案。
