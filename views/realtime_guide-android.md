{% extends "./realtime_guide.tmpl" %}

{% block language %}Android{% endblock %}

{% block setup_init %}在 Application 的 `onCreate` 方法中对实时通信服务进行初始化：

```java
public class MyApplication extends Application{

    public void onCreate(){
      ...
      // 你的 AppID、AppKey
      AVOSCloud.initialize(this,"{{appid}}","{{appkey}}");
      ...
    }
}
```

并在 AndroidManifest.xml 中间声明：

```xml
<manifest>
   ...

   <application
        android:name=".MyApplication"
        ....>
        ...

        <service android:name="com.avos.avoscloud.PushService" />

        <receiver android:name="com.avos.avoscloud.AVBroadcastReceiver">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <action android:name="android.intent.action.USER_PRESENT" />
            </intent-filter>
        </receiver>
        ...
   </application>

</manifest>
```
{% endblock %}

{% block demo %}
* [LeanMessage](https://github.com/leancloud/LeanMessage-Demo)（推荐）
* [LeanChat](https://github.com/leancloud/leanchat-android)
{% endblock %}

{% block oneOnOneChat_sent %}

```
  public void sendMessageToJerryFromTom() {
    // Tom 用自己的名字作为clientId，获取AVIMClient对象实例
    AVIMClient tom = AVIMClient.getInstance("Tom");
    // 与服务器连接
    tom.open(new AVIMClientCallback() {
      @Override
      public void done(AVIMClient client, AVIMException e) {
        if (e == null) {
          // 创建与Jerry之间的会话
          client.createConversation(Arrays.asList("Tom", "Jerry"), "Tom & Jerry", null,
              new AVIMConversationCreatedCallback() {

                @Override
                public void done(AVIMConversation conversation, AVIMException e) {
                  if (e == null) {
                    AVIMTextMessage msg = new AVIMTextMessage();
                    msg.setText("耗子，起床！");
                    // 发送消息
                    conversation.sendMessage(msg, new AVIMConversationCallback() {

                      @Override
                      public void done(AVIMException e) {
                        if (e == null) {
                          Log.d("Tom & Jerry", "发送成功！");
                        }
                      }
                    });
                  }
                }
              });
        }
      }
    });
  }
```
{% endblock %}

{% block oneOnOneChat_received %}

```
public class MyApplication extends Application{
 public static class CustomMessageHandler implements AVIMMessageHandler{
   //接收到消息后的处理逻辑 
   @Override
   public void onMessage(AVIMMessage message,AVIMConversation conversation,AVIMClient client){
     if(message instanceof AVIMTextMessage){
       Log.d("Tom & Jerry",((AVIMTextMessage)message).getText());
     }
   }
   
   public void onMessageReceipt(AVIMMessage message,AVIMConversation conversation,AVIMClient client){
   
   }
 }	
 public void onCreate(){
   ...
   AVOSCloud.initialize(this,"{{appid}}","{{appkey}}");   
   //注册默认的消息处理逻辑
   AVIMMessageManager.registerDefaultMessageHandler(new CustomMessageHandler());
   ...
 }
...
public void JerryReceiveMsgFromTom(){
  //Jerry登录
  AVIMClient jerry = AVIMClient.getInstance("Jerry");
  jerry.open(new AVIMClientCallback(){
  
    @Override
    public void done(AVIMClient client,AVIMException e){
    	if(e==null){
    	 ...//登录成功后的逻辑
    	}
    }
  });
}
}
```
{% endblock %}

{% block androidMessageHandler %}
#### MessageHandler的处理逻辑

在 Android SDK 中接收消息的 AVIMMessageHandler 在 AVIMMessageManager 中进行注册时有两个不同的方法： `registerDefaultMessageHandler` 和 `registerMessageHandler`。
在 `AVIMMessageManager` 中多次注册 `defaultMessageHandler` ，只有最后一次调用的才是有效的；而通过 `registerMessageHandler` 注册的 `AVIMMessageHandler`，则是可以同存的。

当客户端收到一条消息的时候，会优先根据消息类型通知当前所有注册的对应类型的普通的 `messageHandler`,如果发现当前没有任何注册的普通的 `messageHandler`，才会去通知 `defaultMessageHandler`。

通过在UI组件(比如 Activity)的 `onCreate` 方法中间去调用 `registerMessageHandler`,而在 `onPaused` 方法中间调用 `unregisterMessageHandler` 的组合，让对应的 `messageHandler` 处理当前页面的处理逻辑；而当没有页面时，则通过 defaultMessageHandler 去发送 `Notification`。

{% endblock %}

{% block oneOnOneChat_received_steps %}
接收消息之前，需要先定义好自己的 `AVIMMessageHandler` 来响应新消息到达的通知，如上例中的 `CustomMessageHandler`。然后通过 `AVIMMessageManager.registerMessageHandler()` 函数来实现绑定。`AVIMMessageManager` 类中还有一个方法 `registerDefaultMessageHandler()` 则用来指定全局默认的消息处理 handler。

> 注意：`AVIMMessageManager.registerDefaultMessageHandler()` 一定要在 `AVIMClient.open()` 之前调用，否则可能导致服务器发回来的部分消息丢失。

然后通过 `AVIMMessageHandler.onMessage()` 函数来接收消息。
{% endblock %}

{% block groupChat_sent %}

```
  public void sendMessageToJerryFromTom() {
    // Tom 用自己的名字作为clientId，获取AVIMClient对象实例
    AVIMClient tom = AVIMClient.getInstance("Tom");
    // 与服务器连接
    tom.open(new AVIMClientCallback() {
      @Override
      public void done(AVIMClient client, AVIMException e) {
        if (e == null) {
          // 创建与Jerry之间的会话
          client.createConversation(Arrays.asList("Tom", "Jerry","Bob","Harry","William"), "Tom & Jerry", null,
              new AVIMConversationCreatedCallback() {

                @Override
                public void done(AVIMConversation conversation, AVIMException e) {
                  if (e == null) {
                    AVIMTextMessage msg = new AVIMTextMessage();
                    msg.setText("你们在哪儿？");
                    // 发送消息
                    conversation.sendMessage(msg, new AVIMConversationCallback() {

                      @Override
                      public void done(AVIMException e) {
                        if (e == null) {
                          Log.d("Tom & Jerry", "发送成功！");
                        }
                      }
                    });
                  }
                }
              });
        }
      }
    });
  }
```
{% endblock %}

{% block groupChat_received %}

```
public class MyApplication extends Application{
  public void onCreate(){
   ...
   AVOSCloud.initialize(this,"{{appid}}","{{appkey}}");
   //这里指定只处理AVIMTextMessage类型的消息
   AVIMMessageManager.registerMessageHandler(AVIMTextMessage.class,new CustomMessageHanlder());
  }
}

- CustomMessageHandler.java
 public class CustomMessageHandler<AVIMTextMessage> implements AVTypedMessageHandler{
 
  @Override
  public void onMessage(AVIMTextMessage msg,AVIMConversation conv,AVIMClient client){
    Log.d("Tom & Jerry",msg.getText();)//你们在哪儿?
    AVIMTextMessage reply = new AVIMTextMessage();
    reply.setText("Tom，我在 Jerry 家，你跟 Harry 什么时候过来？还有 William 和你在一起么？");
    conversation.sendMessage(reply,new AVIMConversationCallback(){
  	   public void done(AVIMException e){
  	     if(e==null){
  	     //回复成功!
  	     }
  	   }
  	 });
  }
  
  public void onMessageReceipt(AVIMTextMessage msg,AVIMConversation conv,AVIMClient client){
  
  }
  
- SomeActivity.java
public void loginAsJerry(){
	AVIMClient bob = AVIMClient.getInstance("Bob");
	//Bob登录
	bob.open(new AVIMClientCallback(){
	  public void done(AVIMClient client,AVIMException e){
	  	if(e==null){
	  		//登录成功
	  	}
	  }
	});
}
}
```
{% endblock %}

{% block imageMessage_local_sent %}

```
public void sendImage(String filePath){
  AVIMClient tom = AVIMClient.getInstance("Tom");

  tom.open(new AVIMClientCallback(){
  
    @Override
    public void done(AVIMClient client,AVIMException e){
      if(e==null){
      //登录成功
      client.createConversation(Arrays.asList("Jerry"),new AVIMConversationCreatedCallback(){
      
        @Override
        public void done(AVIMConversation conv,AVIMException e){
          if(e==null){
            AVIMImageMessage picture = new AVIMImageMessage(filePath);
            picture.setText("发自我的小米");
            Map<String,Object> attributes = new HashMap<String,Object>();
            attributes.put("location","旧金山");
            picture.setAttribute(attributes);
            conv.sendMessage(picture,new AVIMConversationCallback(){
              
              @Override
              public void done(AVIMException e){
                if(e==null){
                //发送成功！
                }
              }
            });
          }
        }
      });
      }
    }
  });
}
```
{% endblock %}

{% block imageMessage_url_sent %}
```
    AVIMClient tom = AVIMClient.getInstance("Tom");
    tom.open(new AVIMClientCallback() {
      @Override
      public void done(AVIMClient client, AVIMException e) {
        if (e == null) {
          // 创建名为“猫和老鼠”的对话
          client.createConversation(Arrays.asList("Jerry"), "猫和老鼠", null,
              new AVIMConversationCreatedCallback() {
                @Override
                public void done(AVIMConversation conv, AVIMException e) {
                  if (e == null) {
                    AVFile file =
                        new AVFile("萌妹子",
                            "http://pic2.zhimg.com/6c10e6053c739ed0ce676a0aff15cf1c.gif", null);
                    AVIMImageMessage m = new AVIMImageMessage(file);
                    m.setText("萌妹子一枚");
                    // 创建一条图片消息
                    conv.sendMessage(m, new AVIMConversationCallback() {
                      @Override
                      public void done(AVIMException e) {
                        if (e == null) {
                          // 发送成功
                        }
                      }
                    });
                  }
                }
              });
        }
      }
    });
```
{% endblock %}

{% block imageMessage_received_intro %}

{% endblock %}

{% block imageMessage_received %}

```
//注册消息处理逻辑
AVIMMessageManager.registerMessageHandler(AVIMImageMessage.class,
        new AVIMTypedMessageHandler<AVIMImageMessage>() {

          @Override
          public void onMessage(AVIMImageMessage msg, AVIMConversation conv, AVIMClient client) {
          	//只处理 Jerry 这个客户端的消息
          	//并且来自 conversationId 为 55117292e4b065f7ee9edd29 的conversation 的消息	
            if ("Jerry".equals(client.getClientId()) && "55117292e4b065f7ee9edd29".equals(conv.getConversationId())) {
              if () {
                String fromClientId = msg.getFrom();
                String messageId = msg.getMessageId();
                String url = msg.getFileUrl();
                Map<String, Object> metaData = msg.getFileMetaData();
                if (metaData.containsKey("size")) {
                  int size = (Integer) metaData.get("size");
                }
                if (metaData.containsKey("width")) {
                  int width = (Integer) metaData.get("width");
                }
                if (metaData.containsKey("height")) {
                  int height = (Integer) metaData.get("height");
                }
                if (metaData.containsKey("format")) {
                  String format = (String) metaData.get("formate");
                }
              }
            }
          }
        });
        
    AVIMClient jerry = AVIMClient.getInstance("Jerry");
    jerry.open(new AVIMClientCallback() {
      @Override
      public void done(AVIMClient client, AVIMException e) {
        if (e == null) {

        }
      }
    });
```
{% endblock %}

{% block audioMessage_local_sent %}
```
 AVIMClient tom = AVIMClient.getInstance("Tom");
    tom.open(new AVIMClientCallback() {
      @Override
      public void done(AVIMClient client, AVIMException e) {
        if (e == null) {
          // 创建名为“猫和老鼠”的对话
          client.createConversation(Arrays.asList("Jerry"), "猫和老鼠", null,
              new AVIMConversationCreatedCallback() {
                @Override
                public void done(AVIMConversation conv, AVIMException e) {
                  if (e == null) {
                    AVFile file =
                        AVFile.withAbsoluteLocalPath("忐忑.mp3",localFilePath);
                    AVIMAudioMessage m = new AVIMAudioMessage(file);
                    m.setText("听听人类的神曲~");
                    // 创建一条音频消息
                    conv.sendMessage(m, new AVIMConversationCallback() {
                      @Override
                      public void done(AVIMException e) {
                        if (e == null) {
                          // 发送成功
                        }
                      }
                    });
                  }
                }
              });
        }
      }
    });
``` 
{% endblock %}

{% block audioMessage_url_sent %}
```
AVIMClient tom = AVIMClient.getInstance("Tom");
    tom.open(new AVIMClientCallback() {
      @Override
      public void done(AVIMClient client, AVIMException e) {
        if (e == null) {
          // 创建名为“猫和老鼠”的对话
          client.createConversation(Arrays.asList("Jerry"), "猫和老鼠", null,
              new AVIMConversationCreatedCallback() {
                @Override
                public void done(AVIMConversation conv, AVIMException e) {
                  if (e == null) {
                    AVFile file =
                        new AVFile("music", "http://ac-lhzo7z96.clouddn.com/1427444393952", null);
                    AVIMAudioMessage m = new AVIMAudioMessage(file);
                    // 创建一条音频消息
                    conv.sendMessage(m, new AVIMConversationCallback() {
                      @Override
                      public void done(AVIMException e) {
                        if (e == null) {
                          // 发送成功
                        }
                      }
                    });
                  }
                }
              });
        }
      }
    });
```
{% endblock %}

{% block audioMessage_received_intro %}

```
AVIMMessageManager.registerMessageHandler(AVIMAudioMessage.class,
        new AVIMTypedMessageHandler<AVIMAudioMessage>() {

          @Override
          public void onMessage(AVIMAudioMessage msg, AVIMConversation conv, AVIMClient client) {
          	//只处理 Jerry 这个客户端的消息
          	//并且来自 conversationId 为 55117292e4b065f7ee9edd29 的conversation 的消息	
            if ("Jerry".equals(client.getClientId()) && "55117292e4b065f7ee9edd29".equals(conv.getConversationId())) {
              if () {
                String fromClientId = msg.getFrom();
                String messageId = msg.getMessageId();
                String url = msg.getFileUrl();
                Map<String, Object> metaData = msg.getFileMetaData();
                if (metaData.containsKey("size")) {
                  int size = (Integer) metaData.get("size");
                }
                  if (metaData.containsKey("format")) {
                  String format = (String) metaData.get("formate");
                }
              }
            }
          }
        });
        
    AVIMClient jerry = AVIMClient.getInstance("Jerry");
    jerry.open(new AVIMClientCallback() {
      @Override
      public void done(AVIMClient client, AVIMException e) {
        if (e == null) {

        }
      }
    });

```

{% endblock %}

{% block videoMessage_local_sent %}
```
    AVIMClient tom = AVIMClient.getInstance("Tom");
    tom.open(new AVIMClientCallback() {
      @Override
      public void done(AVIMClient client, AVIMException e) {
        if (e == null) {
          // 创建名为“猫和老鼠”的对话
          client.createConversation(Arrays.asList("Jerry"), "猫和老鼠", null,
              new AVIMConversationCreatedCallback() {
                @Override
                public void done(AVIMConversation conv, AVIMException e) {
                  if (e == null) {
                    AVFile file =
                        AVFile.withAbsoluteLocalPath("bbc_奶酪.mp3", localFilePath);
                    AVIMVideoMessage m = new AVIMVideoMessage(file);
                    // 创建一条视频消息
                    conv.sendMessage(m, new AVIMConversationCallback() {
                      @Override
                      public void done(AVIMException e) {
                        if (e == null) {
                          // 发送成功
                        }
                      }
                    });
                  }
                }
              });
        }
      }
    });
```
{% endblock %}

{% block videoMessage_url_sent %}

```
 AVIMClient tom = AVIMClient.getInstance("Tom");
    tom.open(new AVIMClientCallback() {
      @Override
      public void done(AVIMClient client, AVIMException e) {
        if (e == null) {
          // 创建名为“猫和老鼠”的对话
          client.createConversation(Arrays.asList("Jerry"), "猫和老鼠", null,
              new AVIMConversationCreatedCallback() {
                @Override
                public void done(AVIMConversation conv, AVIMException e) {
                  if (e == null) {
                    AVFile file =
                        new AVFile("video", "http://ac-lhzo7z96.clouddn.com/1427267336319", null);
                    AVIMVideoMessage m = new AVIMVideoMessage(file);
                    // 创建一条视频消息
                    conv.sendMessage(m, new AVIMConversationCallback() {
                      @Override
                      public void done(AVIMException e) {
                        if (e == null) {
                          // 发送成功
                        }
                      }
                    });
                  }
                }
              });
        }
      }
    });
```
{% endblock %}
{% block videoMessage_received_intro %}
视频消息的接收与图像消息一样，它的元数据获取都可以通过 `getFileMetaData()` 来获取。
{% endblock %}
{% block fileMessage_sent %}
```

    AVIMClient tom = AVIMClient.getInstance("Tom");
    tom.open(new AVIMClientCallback() {
      @Override
      public void done(AVIMClient client, AVIMException e) {
        if (e == null) {
          // 创建名为“猫和老鼠”的对话
          client.createConversation(Arrays.asList("Jerry"), "猫和老鼠", null,
              new AVIMConversationCreatedCallback() {
                @Override
                public void done(AVIMConversation conv, AVIMException e) {
                  if (e == null) {
                    AVFile file =
                        AVFile.withAbsoluteLocalPath("leancloud.doc", localFilePath);
                    AVIMFileMessage m = new AVIMFileMessage(file);
                    // 创建一条文件消息
                    conv.sendMessage(m, new AVIMConversationCallback() {
                      @Override
                      public void done(AVIMException e) {
                        if (e == null) {
                          // 发送成功
                        }
                      }
                    });
                  }
                }
              });
        }
      }
    });

```
{% endblock %}

{% block fileMessage_received_intro %}
文件消息的接收与图像消息一样，它的元数据获取都可以通过 `getFileMetaData()` 来获取。
{% endblock %}

{% block locationMessage_new %}
```
      AVIMLocationMessage m = new AVIMLocationMessage();
      m.setLocation(new AVGeoPoint(45.0,34.0));
 ```
{% endblock %}

{% block locationMessage_sent %}
```
    AVIMClient tom = AVIMClient.getInstance("Tom");
    tom.open(new AVIMClientCallback() {
      @Override
      public void done(AVIMClient client, AVIMException e) {
        if (e == null) {
          // 创建名为“猫和老鼠”的对话
          client.createConversation(Arrays.asList("Jerry"), "猫和老鼠", null,
              new AVIMConversationCreatedCallback() {
                @Override
                public void done(AVIMConversation conv, AVIMException e) {
                  if (e == null) {
                      //创建一个地理位置信息
                      AVIMLocationMessage m = new AVIMLocationMessage();
                      m.setLocation(new AVGeoPoint(138.12454, 52.56461));
                      m.setText("好利来新店");
                    conv.sendMessage(m, new AVIMConversationCallback() {
                      @Override
                      public void done(AVIMException e) {
                        if (e == null) {
                          // 发送成功
                        }
                      }
                    });
                  }
                }
              });
        }
      }
    });
}
```
{% endblock %}

{% block locationMessage_received_intro %}

```
地址消息的接收与图像消息一样，它的地址信息可以通过 `getLocation` 方法来获取
```

{% endblock %}

{% block typedMessage_received %}
### 接收富媒体消息

实时通信 SDK 内部封装了对富媒体消息的支持，所有富媒体消息都是从 AVIMTypedMessage 派生出来的。发送的时候可以直接调用 `conversation.sendMessage()` 函数。在接收端，我们也专门增加了一类回调接口 AVIMTypedMessageHandler，其定义为：

```
public class AVIMTypedMessageHandler<T extends AVIMTypedMessage> extends MessageHandler<T> {

  @Override
  public void onMessage(T message, AVIMConversation conversation, AVIMClient client);

  @Override
  public void onMessageReceipt(T message, AVIMConversation conversation, AVIMClient client);
}
```

开发者可以编写自己的消息处理 handler，然后调用 `AVIMMessageManager.registerMessageHandler()` 函数来注册目标 handler。

接收端对于富媒体消息的通知处理的示例代码如下：

```
class MsgHandler extends AVIMTypedMessageHandler<AVIMTypedMessage> {

  @Override
  public void onMessage(AVIMTypedMessage message, AVIMConversation conversation, AVIMClient client) {
    // 请按自己需求改写
    switch(message.getMessageType()) {
    case AVIMReservedMessageType.TextMessageType:
      AVIMTextMessage textMsg = (AVIMTextMessage)message;
      Logger.d("收到文本消息:" + textMsg.getText() + ", msgId:" + textMsg.getMessageId());
      break;

    case AVIMReservedMessageType.FileMessageType:
      AVIMFileMessage fileMsg = (AVIMFileMessage)message;
      Logger.id("收到文件消息。msgId=" + fileMsg.getMessageId() + ", url=" + fileMsg.getFileUrl() + ", size=" + fileMsg.getSize());
      break;

    case AVIMReservedMessageType.ImageMessageType:
      AVIMImageMessage imageMsg = (AVIMImageMessage)message;
      Logger.id("收到图片消息。msgId=" + imageMsg.getMessageId() + ", url=" + imageMsg.getFileUrl() + ", width=" + imageMsg.getWidth() + ", height=" + imageMsg.getHeight());
      break;

    case AVIMReservedMessageType.AudioMessageType:
      AVIMAudioMessage audioMsg = (AVIMAudioMessage)message;
      Logger.id("收到音频消息。msgId=" + audioMsg.getMessageId() + ", url=" + audioMsg.getFileUrl() + ", duration=" + audioMsg.getDuration());
      break;

    case AVIMReservedMessageType.VideoMessageType:
      AVIMVideoMessage videoMsg = (AVIMAudioMessage)message;
      Logger.id("收到视频消息。msgId=" + videoMsg.getMessageId() + ", url=" + videoMsg.getFileUrl() + ", duration=" + videoMsg.getDuration());
      break;

    case AVIMReservedMessageType.LocationMessageType:
      AVIMLocationMessage locMsg = (AVIMLocationMessage)message;
      Logger.id("收到位置消息。msgId=" + locMsg.getMessageId() + ", latitude=" + locMsg.getLocation().getLatitude() + ", longitude=" + locMsg.getLocation().getLongitude());
      break;
    }
  }

  @Override
  public void onMessageReceipt(AVIMTypedMessage message, AVIMConversation conversation, AVIMClient client) {
    // 请加入你自己需要的逻辑...
  }
}

MsgHandler msgHandler = new MsgHandler();
AVIMMessageManager.registerMessageHandler(AVIMTypedMessage.class, msgHandler);
```

SDK 内部在接收消息时的处理逻辑是这样的：

* 当收到新消息时，实时通信 SDK 会先解析消息的类型，然后找到开发者为这一类型所注册的处理响应 handler，再逐一调用这些 handler 的 onMessage 函数。
* 如果没有找到专门处理这一类型消息的 handler，就会转交给 defaultHandler 处理。

这样一来，在开发者为 `TypedMessage`（及其子类） 指定了专门的 handler，也指定了全局的 defaultHandler 了的时候，如果发送端发送的是通用的 AVIMMessage 消息，那么接受端就是 `AVIMMessageManager.registerDefaultMessageHandler()` 中指定的 handler 被调用；如果发送的是 AVIMTypedMessage（及其子类）的消息，那么接受端就是 `AVIMMessageManager.registerMessageHandler()` 中指定的 handler 被调用。
{% endblock %}

{% block transientMessage_sent %}

```
//自定义的消息类型，用于发送和接收所有的用户操作消息
- AVIMOperationMessage.java
 
//指定type类型，可以根据实际换成其他正整数
@AVIMMessageType(type = 1)
public class AVIMOperationMessage extends AVIMTypedMessage {

  @AVIMMessageField(name = "op")
  String op;

  public String getOp() {
    return op;
  }

  public void setOp(String op) {
    this.op = op;
  }
}
- CustomApplication.java
public CustomApplication extends Application {
   ...
   //注册自定义的消息类型
   AVIMMessageManager.registerAVIMMessageType(AVIMOperationMessage.class);
   ...
}

- SomeActivity.java

AVIMClient tom = AVIMClient.getInstance("Tom");
    tom.open(new AVIMClientCallback() {
      @Override
      public void done(AVIMClient client, AVIMException e) {
        if (e == null) {
          // 登录成功
          AVIMConversation conv = client.getConversation("551260efe4b01608686c3e0f");
          AVIMOperationMessage msg = new AVIMOperationMessage();
          msg.setOp("keyboard inputing");
          conv.sendMessage(msg, AVIMConversation.TRANSIENT_MESSAGE_FLAG,
              new AVIMConversationCallback() {
                @Override
                public void done(AVIMException e) {
                  if (e == null) {
                    // 发送成功
                  }
                }
              });
        }
      }
    });

```
{% endblock %}

{% block transientMessage_received %}

```
//自定义的消息类型，用于发送和接收所有的用户操作消息
- AVIMOperationMessage.java
 
//指定type类型，可以根据实际换成其他正整数
@AVIMMessageType(type = 1)
public class AVIMOperationMessage extends AVIMTypedMessage {

  @AVIMMessageField(name = "op")
  String op;

  public String getOp() {
    return op;
  }

  public void setOp(String op) {
    this.op = op;
  }
}
- CustomApplication.java
public CustomApplication extends Application {
   ...
   //注册自定义的消息类型
   AVIMMessageManager.registerAVIMMessageType(AVIMOperationMessage.class);
   ...
}

- SomeActivity.java
 
  final String USER_OPERATION = "% is %";
  AVIMMessageManager.registerMessageHandler(AVIMOperationMessage.class,
        new AVIMTypedMessageHandler<AVIMOperationMessage>() {

          @Override
          public void onMessage(AVIMOperationMessage msg, AVIMConversation conv, AVIMClient client) {
            if ("Jerry".equals(client.getClientId())
                && "551260efe4b01608686c3e0f".equals(conv.getConversationId())) {
              String opeartion = String.format(USER_OPERATION, msg.getFrom(), msg.getOp());
              System.out.println(opeartion);
            }
          }
        });
    AVIMClient jerry = AVIMClient.getInstance("Jerry");
    jerry.open(new AVIMClientCallback() {
      @Override
      public void done(AVIMClient client, AVIMException e) {
        if (e == null) {
          // 登录成功
        }
      }
    });
```
{% endblock %}

{% block offlineMessage_android %}>**Android 聊天服务是和后台的推送服务共享连接的，所以只要有网络就永远在线，不需要专门做推送。**消息达到后，你可以根据用户的设置来判断是否需要弹出通知。网络断开时，我们为每个对话保存 20 条离线消息。{% endblock %}

{% block message_sent_ack %}

```
AVIMMessageHandler handler = new AVIMMessageHandler(){

    public void onMessageReceipt(AVIMMessage message, AVIMConversation conversation, AVIMClient client) {
     //此处就是对方收到消息以后的回调
	  Log.i("Tom & Jerry","msg received");
  }
}

//注册对应的handler
AVIMMessageManager.registerMessageHandler(AVIMMessage.class,handler);

//发送消息

AVIMClient jerry = AVIMClient.getInstance("Jeery");
AVIMConversation conv = jerry.getConversation("551260efe4b01608686c3e0f");
AVIMMessage msg = new AVIMMessage();
msg.setContent("Ping");
conv.sendMessage(msg,AVIMConversation.RECEIPT_MESSAGE_FLAG);

```
{% endblock %}

{% block messagePolicy_received_intro %}{% endblock %}


{% block message_Relation_intro %}
消息类型之间的关系

![消息的类图](http://ac-lhzo7z96.clouddn.com/1440485935481)

{% endblock %}

{% block message_Properties_intro %}

属性|描述
---|---
content|消息内容
clientId|指消息发送者的 clientId
conversationId|消息所属对话 id
messageId|消息发送成功之后，由 LeanCloud 云端给每条消息赋予的唯一 id
timestamp|消息发送的时间。消息发送成功之后，由 LeanCloud 云端赋予的全局的时间戳。
receiptTimestamp| 消息被对方接收到的时间。消息被接收之后，由 LeanCloud 云端赋予的全局的时间戳。
status|消息状态，有五种取值：<br/><br/>`AVIMMessageStatusNone`（未知）<br/>`AVIMMessageStatusSending`（发送中）<br/>`AVIMMessageStatusSent`（发送成功）<br/>`AVIMMessageStatusReceipt`（被接收）<br/>`AVIMMessageStatusFailed`（失败）
ioType|消息传输方向，有两种取值：<br/><br/>`AVIMMessageIOTypeIn`（发给当前用户）<br/>`AVIMMessageIOTypeOut`（由当前用户发出）

我们为每一种富媒体消息定义了一个消息类型，实时通信 SDK 自身使用的类型是负数（如下面列表所示），所有正数留给开发者自定义扩展类型使用，0 作为「没有类型」被保留起来。

消息 | 类型
--- | ---
文本消息|-1
图像消息|-2
音频消息|-3
视频消息|-4
位置消息|-5
文件消息|-6
 
{% endblock %}

{% block attributes %} `AVIMMessage.attributes` {% endblock %}

{% block attributes_property %}attributes{% endblock %}

{% block customAttributesMessage_sent %}

```
AVIMClient tom = AVIMClient.getInstance("Tom");
    tom.open(new AVIMClientCallback() {
      @Override
      public void done(AVIMClient client, AVIMException e) {
        if (e == null) {
          AVIMImageMessage msg = new AVIMImageMessage(someLocalFile);
          Map<String, Object> attributes = new HashMap<String, Object>();
          attributes.put("location", "拉萨布达拉宫");
          attributes.put("Title", "这蓝天……我彻底是醉了");
          msg.setAttrs(attributes);
          client.getConversation("551260efe4b01608686c3e0f").sendMessage(msg,
              new AVIMConversationCallback() {
                @Override
                public void done(AVIMException e) {
                  if (e == null) {
                    // 发送成功
                  }
                }
              });
        }
      }
    });
```
{% endblock %}

{% block customAttributesMessage_received %}

```
    AVIMMessageManager.registerMessageHandler(AVIMImageMessage.class,
        new AVIMTypedMessageHandler<AVIMImageMessage>() {
          @Override
          public void onMessage(AVIMImageMessage msg, AVIMConversation conv, AVIMClient client) {
            //此处应该是"拉萨布达拉宫"
            System.out.println(msg.getAttrs().get("location"));
          }
        });
    AVIMClient friend = AVIMClient.getInstance("friend");
    friend.open(new AVIMClientCallback() {
      @Override
      public void done(AVIMClient client, AVIMException e) {
        if (e == null) {}
      }
    });
```
{% endblock %}

{% block customMessage_create %}

```
AVIMClient tom = AVIMClient.getInstance("Tom");
    tom.open(new AVIMClientCallback() {
      @Override
      public void done(AVIMClient client, AVIMException e) {
        if (e == null) {
          AVIMImageMessage msg = new AVIMImageMessage(someLocalFile);
          Map<String, Object> attributes = new HashMap<String, Object>();
          attributes.put("location", "拉萨布达拉宫");
          attributes.put("Title", "这蓝天……我彻底是醉了");
          msg.setAttrs(attributes);
          client.getConversation("551260efe4b01608686c3e0f").sendMessage(msg,
              new AVIMConversationCallback() {
                @Override
                public void done(AVIMException e) {
                  if (e == null) {
                    // 发送成功
                  }
                }
              });
        }
      }
    });
```
{% endblock %}

{% block customMessage_create %}
继承于 AVIMTypedMessage，开发者也可以扩展自己的富媒体消息。其要求和步骤是：

* 实现新的消息类型，继承自 AVIMTypedMessage。这里需要注意两点：
  * 在 class 上增加一个 @AVIMMessageType(type=123) 的 Annotation，具体消息类型的值（这里是 `123`）由开发者自己决定（LeanCloud 内建的 [消息类型使用负数](#消息类详解)，所有正数都预留给开发者扩展使用）。
  * 在消息内部属性上要增加 @AVIMMessageField(name="") 的 Annotation，name 为可选字段在声明字段属性，同时自定义的字段要有对应的 getter/setter 方法。
* 调用 `AVIMMessageManager.registerAVIMMessageType()` 函数进行类型注册。
* 调用 `AVIMMessageManager.registerMessageHandler()` 函数进行消息处理 handler 注册。

AVIMTextMessage 的源码如下，可供参考：

```
@AVIMMessageType(type = -1)
public class AVIMTextMessage extends AVIMTypedMessage {

  @AVIMMessageField(name = "_lctext")
  String text;
  @AVIMMessageField(name = "_lcattrs")
  Map<String, Object> attrs;

  public String getText() {
    return this.text;
  }

  public void setText(String text) {
    this.text = text;
  }

  public Map<String, Object> getAttrs() {
    return this.attrs;
  }

  public void setAttrs(Map<String, Object> attr) {
    this.attrs = attr;
  }
}
```
{% endblock %}

{% block messagePolicy_sent_method %} `AVIMClient.OnMessageReceived` {% endblock %}

{% block messagePolicy_received_method %}{% endblock %}

{% block messagePolicy_received %}{% endblock %}

{% block conversation_init %}
```
 AVIMClient jerry = AVIMClient.getInstance("Jerry");
    jerry.open(new AVIMClientCallback() {
      @Override
      public void done(AVIMClient client, AVIMException e) {
        if (e == null) {
          // 创建名为“猫和老鼠”的对话
          client.createConversation(Arrays.asList("Bob", "Harry", "William"), "猫和老鼠", null,
              new AVIMConversationCreatedCallback() {
                @Override
                public void done(AVIMConversation conv, AVIMException e) {
                  if (e == null) {
                    // 创建成功
                  }
                }
              });
        }
      }
    });
```
{% endblock %}

{% block event_memberJoin %} `onMemberJoined` {% endblock %}

{% block event_memberLeft %} `onMemberLeft` {% endblock %}

{% block event_kicked %} `onKicked` {% endblock %}

{% block event_invited %} `onInvited` {% endblock %}

{% block conversation_join %}

```
AVIMClient tom = AVIMClient.getInstance("Tom");
tom.open(new AVIMClientCallback(){

	@Override
	public void done(AVIMClient client,AVIMException e){
	  if(e==null){
	  //登录成功
		AVIMConversation conv = client.getConversation("551260efe4b01608686c3e0f");
		conv.join(new AVIMConversationCallback(){
			@Override
			public void done(AVIMException e){
			  if(e==null){
			  //加入成功
			  }
			}
		});
	  }
	}
});

```
{% endblock %}

{% block conversation_membersChanged %}{% endblock %}


{% block conversation_memebersJoined %}
```
AVIMMessageManager.setConversationEventHandler(new CustomConversationEventHandler());
AVIMClient bob = AVIMClient.getInstance("Bob");
bob.open(new AVIMClientCallback(){

	@Override
	public void done(AVIMClient client,AVIMException e){
	  if(e==null){
	  //登录成功
	  }
	}
});

-- CustomConversationEventHandler.java
public class CustomConversationEventHandler extends AVIMConversationEventHandler {

  @Override
  public void onMemberLeft(AVIMClient client, AVIMConversation conversation, List<String> members,
      String kickedBy) {
    Toast.makeText(AVOSCloud.applicationContext,
        members + " kicked from:" + conversation.getConversationId() + " by "
            + kickedBy, Toast.LENGTH_SHORT).show();
  }

  @Override
  public void onMemberJoined(AVIMClient client, AVIMConversation conversation,
      List<String> members, String invitedBy) {
    Toast.makeText(AVOSCloud.applicationContext,
        members + " invited to:" + conversation.getConversationId() + " by "
            + invitedBy, Toast.LENGTH_SHORT).show();
  }

  @Override
  public void onKicked(AVIMClient client, AVIMConversation conversation, String kickedBy) {
    Toast.makeText(AVOSCloud.applicationContext,
        "Kicked from:" + conversation.getConversationId() + " by " + kickedBy, Toast.LENGTH_SHORT)
        .show();
  }

  @Override
  public void onInvited(AVIMClient client, AVIMConversation conversation, String invitedBy) {
    Toast.makeText(AVOSCloud.applicationContext,
        "Kicked from:" + conversation.getConversationId() + " by " + invitedBy, Toast.LENGTH_SHORT)
        .show();
  }
}

```
{% endblock %}

{% block conversation_invite %}

```
AVIMClient jerry = AVIMClient.getInstance("Jerry");
jerry.open(new AVIMClientCallback(){

	@Override
	public void done(AVIMClient client,AVIMException e){
	  if(e==null){
	  //登录成功
		final AVIMConversation conv = client.getConversation("551260efe4b01608686c3e0f");
		conv.join(new AVIMConversationCallback(){
			@Override
			public void done(AVIMException e){
			  if(e==null){
			  //加入成功
			  conv.addMembers(Arrays.asList("Mary"),new AVIMConversationCallback(){
			    @Override
			    public void done(AVIMException e){
			    }
			  });
			  }
			}
		});
	  }
	}
});

```
{% endblock %}

{% block conversation_invite_events %}
邀请成功以后，相关方收到通知的时序是这样的：

No.|邀请者|被邀请者|其他人
---|---|---|---
1|发出请求 addMembers| | 
2| |收到 onInvited 通知| 
3|收到 onMemberJoined 通知| | 收到 onMemberJoined 通知
{% endblock %}

{% block conversation_left %}

```
AVIMClient tom = AVIMClient.getInstance("Tom");
tom.open(new AVIMClientCallback(){

	@Override
	public void done(AVIMClient client,AVIMException e){
	  if(e==null){
	  //登录成功
		final AVIMConversation conv = client.getConversation("551260efe4b01608686c3e0f");
		conv.join(new AVIMConversationCallback(){
			@Override
			public void done(AVIMException e){
			  if(e==null){
			  //加入成功
			  conv.quit(new AVIMConversationCallback(){
			    @Override
			    public void done(AVIMException e){
			      if(e==null){
			      //退出成功
			      }
			    } 
			  });
			  }
			}
		});
	  }
	}
});
``` 
{% endblock %}

{% block conversation_kick %}

```
AVIMClient william = AVIMClient.getInstance("William");
william.open(new AVIMClientCallback(){

	@Override
	public void done(AVIMClient client,AVIMException e){
	  if(e==null){
	  //登录成功
		final AVIMConversation conv = client.getConversation("551260efe4b01608686c3e0f");
		conv.join(new AVIMConversationCallback(){
			@Override
			public void done(AVIMException e){
			  if(e==null){
			  //加入成功
			  conv.kickMembers(Arrays.asList("Harry"),new AVIMConversationCallback(){
			  
			  	 @Override
			    public void done(AVIMException e){
			    }
			  );
			  }
			}
		});
	  }
	}
});
```
{% endblock %}

{% block conversation_kick_events %}
踢人时，相关方收到通知的时序如下：

No.|操作者（管理员）|被踢者|其他人
---|---|---|---
1|发出请求 kickMembers| | 
2| |收到 onKicked 通知| |
3|收到 onMemberLeft 通知| |收到 onMemberLeft 通知
{% endblock %}

{% block conversation_countMember_method %} `conversation:countMembersWithCallback:` {% endblock %}

{% block conversation_countMember %}

```
AVIMClient tom = AVIMClient.getInstance("Tom");
tom.open(new AVIMClientCallback(){

	@Override
	public void done(AVIMClient client,AVIMException e){
	  if(e==null){
	  //登录成功
	  AVIMConversationQuery query = client.getConversationQuery();
	  query.setLimit(1);
     query.findInBackground(new AVIMConversationQueryCallback(){
       @Override
       public void done(List<AVIMConversation> convs,AVIMException e){
         if(e==null){
           if(convs!=null && !convs.isEmpty()){
             AVIMConversation conv = convs.get(0);
             conv.getMemberCount(new AVIMConversationMemberCountCallback(){
               
               @Override
               public void done(Integer count,AVIMException e){			
               if(e==null){						
               Log.d("Tom & Jerry","conversation got "+count+" members");
				}
               }
             });
           }
         }
       }
     });
	  }
	}
});
```
{% endblock %}

{% block conversation_name %}

```
AVIMClient tom = AVIMClient.getInstance("Tom");
tom.open(new AVIMClientCallback(){

	@Override
	public void done(AVIMClient client,AVIMException e){
	  if(e==null){
	  //登录成功
	  client.createConversation(Arrays.asList("Black"),"喵星人",null,
	           new AVIMConversationCreatedCallback(){
	           
	             @Override
	             public void done(AVIMConversation conv,AVIMException e){
	               if(e==null){
	                 //创建成功
	               }
	             }
	           });
	  }
	}
});

```
{% endblock %}

{% block conversation_changeName %}

```
AVIMClient black = AVIMClient.getInstance("Black");
black.open(new AVIMClientCallback(){

	@Override
	public void done(AVIMClient client,AVIMException e){
	  if(e==null){
	  //登录成功
	  AVIMConversation conv = client.getConversation("55117292e4b065f7ee9edd29");
	  conv.setName("聪明的喵星人");
	  conv.updateInfoInBackground(new AVIMConversationCallback(){
	    
	    @Override
	    public void done(AVIMException e){	    
	      if(e==null){
	      //更新成功
	      }
	    }
	  });
	  }
	}
});

```
{% endblock %}

{% block conversation_mute %}

```
AVIMClient tom = AVIMClient.getInstance("Tom");
tom.open(new AVIMClientCallback(){

	@Override
	public void done(AVIMClient client,AVIMException e){
	  if(e==null){
	  //登录成功
	  AVIMConversation conv = client.getConversation("551260efe4b01608686c3e0f");
	  conv.mute(new AVIMConversationCallback(){
	  
	    @Override
	    public void done(AVIMException e){
	      if(e==null){
	      //设置成功
	      }
	    }
	  });
	  }
	}
});

```
{% endblock %}

{% block conversation_tag %}

```
AVIMClient tom = AVIMClient.getInstance("Tom");
tom.open(new AVIMClientCallback(){

	@Override
	public void done(AVIMClient client,AVIMException e){
	  if(e==null){
	  //登录成功
	  HashMap<String,Object> attr = new HashMap<String,Object>();
	  attr.put("tag","private");
	  client.createConversation(Arrays.asList("Jerry"),"猫和老鼠",attr,
	           new AVIMConversationCreatedCallback(){
	             @Override
	             public void done(AVIMConversation conv,AVIMException e){
	               if(e==null){
	                 //创建成功
	               }
	             }
	           });
	  }
	}
});
```
{% endblock %}

{% block conversation_getSingle %}

```
AVIMClient tom = AVIMClient.getInstance("Tom");
tom.open(new AVIMClientCallback(){

	@Override
	public void done(AVIMClient client,AVIMException e){
	  if(e==null){
	  //登录成功
	  AVIMConversationQuery query = client.getQuery();
	  query.whereEqualTo("objectId","551260efe4b01608686c3e0f");
	  query.findInBackground(new AVIMConversationQueryCallback(){
	    @Override
	    public void done(List<AVIMConversation> convs,AVIMException e){
	      if(e==null){
			  if(convs!=null && !convs.isEmpty()){
			    //convs.get(0) 就是想要的conversation
			  }
	      }
	    }
	  });
	  }
	}
});
```
{% endblock %}

{% block conversation_getList %}

```
AVIMClient tom = AVIMClient.getInstance("Tom");
tom.open(new AVIMClientCallback(){

	@Override
	public void done(AVIMClient client,AVIMException e){
	  if(e==null){
	  //登录成功
	  AVIMConversationQuery query = client.getQuery();
	  query.findInBackground(new AVIMConversationQueryCallback(){
	    @Override
	    public void done(List<AVIMConversation> convs,AVIMException e){
	      if(e==null){
          //convs就是获取到的conversation列表
	      }
	    }
	  });	  
	  }
	}
});
```
{% endblock %}

{% block conversation_messageHistoryByLimit %}

```
AVIMClient tom = AVIMClient.getInstance("Tom");
bob.open(new AVIMClientCallback(){

	@Override
	public void done(AVIMClient client,AVIMException e){
	  if(e==null){
	  //登录成功
	  AVIMConversation conv = client.getConversation("551260efe4b01608686c3e0f");
	  int limit = 10;// limit 取值范围 1~1000 之内的整数，默认为 20
	  conv.queryMessages(limit,new AVIMMessagesQueryCallback(){
	    @Override
	    public void done(List<AVIMMessage> messages,AVIMException e){	   
        if(e==null){
		     //成功获取最新10条消息记录
		   }
	    }
	  });
	  }
	}
});
```
{% endblock %}

{% block conversation_messageHistoryBeforeId %}

```
AVIMClient tom = AVIMClient.getInstance("Tom");
bob.open(new AVIMClientCallback(){

	@Override
	public void done(AVIMClient client,AVIMException e){
	  if(e==null){
	  //登录成功
	  final AVIMConversation conv = client.getConversation("551260efe4b01608686c3e0f");
	  conv.queryMessages(new AVIMMessagesQueryCallback(){
	    @Override
	    public void done(List<AVIMMessage> messages,AVIMException e){
        if(e==null){
		     if(messages!=null && !messages.isEmpty()){
		       Log.d("Tom & Jerry","got "+messages.size()+" messages ");
		       
		       //返回的消息一定是时间增序排列，也就是最早的消息一定是第一个
		       AVIMMessage eldestMessage = messages.get(0);
		       
		       conv.queryMessages(eldestMessage.getMessageId(),eldestMessage.getTimestamp(),20,
		       new AVIMMessageQueryCallback(){
		         @Override
		         public void done(List<AVIMMessage> msgs,AVIMException e){
		           if(e== null){
		             //查询成功返回
		             Log.d("Tom & Jerry","got "+msgs.size()+" messages ");
		           }
		         }
		       });
		     }
		   }
	    }
	  });
	  }
	}
});
```
{% endblock %}

{% block conversation_messageHistory_pager %}
```
- 初始化 ClientId = Tom
- 获取对话对象 id = 2f08e882f2a11ef07902eeb510d4223b
- 获取最近的 10 条历史消息
- 再根据上一步的第 10 条消息的 msgId，timestamp 和 limit 获取第二页的数据
```
{% endblock %}

{% block conversation_query_equalTo %}

```
AVIMClient tom = AVIMClient.getInstance("Tom");
tom.open(new AVIMClientCallback(){

	@Override
	public void done(AVIMClient client,AVIMException e){
	  if(e==null){
	  //登录成功
	  AVIMConversationQuery query = client.getQuery();
	  query.whereEqualTo("attr.topic","movie");
	  query.findInBackground(new AVIMConversationQueryCallback(){
	    @Override
	    public void done(List<AVIMConversation> convs,AVIMException e){
	      if(e==null){
			  if(convs!=null && !convs.isEmpty()){
			    //获取符合查询条件的Conversation列表
			  }
	      }
	    }
	  });
	  }
	}
});
```
{% endblock %}

{% block conversation_query_notEqualTo %}

```
AVIMClient tom = AVIMClient.getInstance("Tom");
tom.open(new AVIMClientCallback(){

	@Override
	public void done(AVIMClient client,AVIMException e){
	  if(e==null){
	  //登录成功
	  AVIMConversationQuery query = client.getQuery();
	  query.whereNotEqualTo("attr.type","private");
	  query.setLimit(50);//limit 设为 50 ,默认为 10 个
	  
	  query.findInBackground(new AVIMConversationQueryCallback(){
	    @Override
	    public void done(List<AVIMConversation> convs,AVIMException e){
	      if(e==null){
			  if(convs!=null && !convs.isEmpty()){
			    //获取符合查询条件的Conversation列表
			  }
	      }
	    }
	  });
	  }
	}
});
```
{% endblock %}

{% block conversation_query_greaterThan %}

```
AVIMClient tom = AVIMClient.getInstance("Tom");
tom.open(new AVIMClientCallback(){

	@Override
	public void done(AVIMClient client,AVIMException e){
	  if(e==null){
	  //登录成功
	  AVIMConversationQuery query = client.getQuery();
	  query.whereGreaterThan("attr.age",18);
	  
	  query.findInBackground(new AVIMConversationQueryCallback(){
	    @Override
	    public void done(List<AVIMConversation> convs,AVIMException e){
	      if(e==null){
			  if(convs!=null && !convs.isEmpty()){
			    //获取符合查询条件的Conversation列表
			  }
	      }
	    }
	  });
	  }
	}
});
```
{% endblock %}

{% block conversation_query_regexIntro %}
匹配查询是指在 `AVIMConversationQuery` 的查询条件中使用正则表达式来匹配数据。
{% endblock %}

{% block conversation_query_regex %}

```
AVIMClient tom = AVIMClient.getInstance("Tom");
tom.open(new AVIMClientCallback(){

	@Override
	public void done(AVIMClient client,AVIMException e){
	  if(e==null){
	  //登录成功
	  AVIMConversationQuery query = client.getQuery();
	  query.whereMatches("attr.tag","[\\u4e00-\\u9fa5] "); //attr.tag 是中文 
	  
	  query.findInBackground(new AVIMConversationQueryCallback(){
	    @Override
	    public void done(List<AVIMConversation> convs,AVIMException e){
	      if(e==null){
			  if(convs!=null && !convs.isEmpty()){
			    //获取符合查询条件的Conversation列表
			  }
	      }
	    }
	  });
	  }
	}
});
```
{% endblock %}

{% block conversation_query_contains %}

```
AVIMClient tom = AVIMClient.getInstance("Tom");
tom.open(new AVIMClientCallback(){

	@Override
	public void done(AVIMClient client,AVIMException e){
	  if(e==null){
	  //登录成功
	  AVIMConversationQuery query = client.getQuery();
	  
	  //查询attr.keywords 包含 「教育」的Conversation
	  query.whereContains("attr.tag","教育"); 
	  
	  query.findInBackground(new AVIMConversationQueryCallback(){
	    @Override
	    public void done(List<AVIMConversation> convs,AVIMException e){
	      if(e==null){
			  if(convs!=null && !convs.isEmpty()){
			    //获取符合查询条件的Conversation列表
			  }
	      }
	    }
	  });
	  }
	}
});
```
{% endblock %}

{% block conversation_query_findJoinedMemebers %}

```
AVIMClient tom = AVIMClient.getInstance("Tom");
tom.open(new AVIMClientCallback(){

	@Override
	public void done(AVIMClient client,AVIMException e){
	  if(e==null){
	  //登录成功
	  AVIMConversationQuery query = client.getQuery();
	  
	  //查询对话成员有 Bob 和 Jerry的Conversation
	  query.withMembers(Arrays.as("Bob","Jerry"));
	  
	  query.findInBackground(new AVIMConversationQueryCallback(){
	    @Override
	    public void done(List<AVIMConversation> convs,AVIMException e){
	      if(e==null){
			  if(convs!=null && !convs.isEmpty()){
			    //获取符合查询条件的Conversation列表
			  }
	      }
	    }
	  });
	  }
	}
});
```
{% endblock %}

{% block conversation_query_combination %}

```
AVIMClient tom = AVIMClient.getInstance("Tom");
tom.open(new AVIMClientCallback(){

	@Override
	public void done(AVIMClient client,AVIMException e){
	  if(e==null){
	  //登录成功
	  AVIMConversationQuery query = client.getQuery();
	  
	  //查询对话成员有 Bob 和 Jerry的Conversation
	  query.withMembers(Arrays.as("Bob","Jerry"));
	  
	  query.findInBackground(new AVIMConversationQueryCallback(){
	    @Override
	    public void done(List<AVIMConversation> convs,AVIMException e){
	      if(e==null){
			  if(convs!=null && !convs.isEmpty()){
			    //获取符合查询条件的Conversation列表
			  }
	      }
	    }
	  });
	  }
	}
});
```
{% endblock %}


{% block conversation_query_count %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 构建查询条件：attr.keywords 包含「教育」、attr.age < 18
- 执行查询，获取符合条件的对话的数量
```
{% endblock %}

{% block chatroom_intro %}
和建立普通对话类似，建立一个聊天室只是在 `AVIMClient.createConversation(conversationMembers, name, attributes, isTransient, callback)` 中传入 `isTransient=true`。
{% endblock %}

{% block chatroom_new %}

```
AVIMClient tom = AVIMClient.getInstance("Tom");
tom.open(new AVIMClientCallback(){

	@Override
	public void done(AVIMClient client,AVIMException e){
	  if(e==null){
	  //登录成功
	  //创建一个 名为 "HelloKitty PK 加菲猫" 的暂态对话
	  client.createConversation(Collections.emptyList(),"HelloKitty PK 加菲猫",null,true,
	    new AVIMConversationCreatedCallback(){
	      @Override
	      public void done(AVIMConversation conv,AVIMException e){
	        
	      }
	    });
	  }
	}
});

```
{% endblock %}

{% block chatroom_count_method %} `AVIMConversation.getMemberCount()` {% endblock %}

{% block chatroom_count %}

```
AVIMClient tom = AVIMClient.getInstance("Tom");
tom.open(new AVIMClientCallback(){

	@Override
	public void done(AVIMClient client,AVIMException e){
	  if(e==null){
	  //登录成功
	  AVIMConversationQuery query = client.getConversationQuery();
	  query.setLimit(1);
	  //获取第一个会话
     query.findInBackground(new AVIMConversationQueryCallback(){
       @Override
       public void done(List<AVIMConversation> convs,AVIMException e){
         if(e==null){
           if(convs!=null && !convs.isEmpty()){
             AVIMConversation conv = convs.get(0);
             //获取第一个对话的
             conv.getMemberCount(new AVIMConversationMemberCountCallback(){
               
               @Override
               public void done(Integer count,AVIMException e){
               if(e==null){
               Log.d("Tom & Jerry","conversation got "+count+" members");
				}
               }
             });
           }
         }
       }
     });
	  }
	}
});
```
{% endblock %}

{% block chatroom_query_method %} `[AVIMConversationQuery whereKey:]` {% endblock %}

{% block chatroom_query_method2 %} `whereKey:` {% endblock %}

{% block chatroom_query_single %}

```
AVIMClient tom = AVIMClient.getInstance("Tom");
tom.open(new AVIMClientCallback(){

	@Override
	public void done(AVIMClient client,AVIMException e){
	  if(e==null){
	  //登录成功
	  //查询attr.topic为"奔跑吧，兄弟"的暂存聊天室
	  AVIMConversationQuery query = client.getConversationQuery();
	  query.whereEqualTo("attr.topic","奔跑吧，兄弟");
	  query.whereEqualTo("tr",true);
	  //获取第一个会话
     query.findInBackground(new AVIMConversationQueryCallback(){
       @Override
       public void done(List<AVIMConversation> convs,AVIMException e){
         if(e==null){
           if(convs!=null && !convs.isEmpty()){
             AVIMConversation conv = convs.get(0);
             //获取第一个对话的
             conv.getMemberCount(new AVIMConversationMemberCountCallback(){
               
               @Override
               public void done(Integer count,AVIMException e){
               if(e==null){
               Log.d("Tom & Jerry","conversation got "+count+" members");
				}
               }
             });
           }
         }
       }
     });
	  }
	}
});

```
{% endblock %}

{% block networkStatus %}
与网络相关的通知（网络断开、恢复等）会由 `AVIMClientEventHandler` 做出响应，接口函数有：

* `onConnectionPaused()` 指网络连接断开事件发生，此时聊天服务不可用。
* `onConnectionResume()` 指网络连接恢复正常，此时聊天服务变得可用。

在网络中断的情况下，所有的消息收发和对话操作都会出现问题。

通过 `AVIMClient.setClientEventHandler()` 可以设定全局的客户端事件响应（ClientEventHandler）。
{% endblock %}

{% block logout %}

```
AVIMClient tom = AVIMClient.getInstance("Tom");
tom.open(new AVIMClientCallback(){
  
  @Override
  public void done(AVIMClient client,AVIMException e){
  	if(e==null){
  	  //登录成功
  	  client.close(new AVIMClientCallback(){
  	  	@Override
  	  	public void done(AVIMClient client,AVIMException e){
  	  		if(e==null){
  	  		//登出成功
  	  		}
  	  	}
  	  });
  	}
  }
});
```
{% endblock %}

{% block conversation_security %}
客户端这边究竟该如何使用呢？我们只需要实现 SignatureFactory 接口，然后在用户登录之前，把这个接口的实例赋值给 AVIMClient 即可（`AVIMClient.setSignatureFactory(factory)`）。

设定了 signatureFactory 之后，对于需要鉴权的操作，实时通信 SDK 与服务器端通讯的时候都会带上应用自己生成的 Signature 信息，LeanCloud 云端会使用 app 的 masterKey 来验证信息的有效性，保证聊天渠道的安全。

对于 SignatureFactory 接口，我们只需要实现这两个函数即可：

```
  /**
   * 实现一个基础签名方法 其中的签名算法会在SessionManager和AVIMClient(V2)中被使用
   */
  public Signature createSignature(String peerId, List<String> watchIds) throws SignatureException;

  /**
   * 实现AVIMConversation相关的签名计算
   */
  public Signature createConversationSignature(String conversationId, String clientId,
      List<String> targetIds, String action) throws SignatureException;
```

`createSignature` 函数会在用户登录的时候被调用，`createConversationSignature` 会在对话创建/加入、邀请成员、踢出成员等操作时被调用。

你需要做的就是按照前文所述的签名算法实现签名，其中 `Signature` 声明如下：

```
public class Signature {
  public List<String> getSignedPeerIds();
  public void setSignedPeerIds(List<String> signedPeerIds);

  public String getSignature();
  public void setSignature(String signature);

  public long getTimestamp();
  public void setTimestamp(long timestamp);

  public String getNonce();
  public void setNonce(String nonce);
}
```

其中四个属性分别是:

* signature 签名
* timestamp 时间戳，单位秒
* nonce 随机字符串 nonce
* signedPeerIds 放行的 clientId 列表，v2 中已经**废弃不用**

下面的代码展示了基于 LeanCloud 云代码进行签名时，客户端的实现片段，你可以参考它来完成自己的逻辑实现：

```
public class KeepAliveSignatureFactory implements SignatureFactory {
 @Override
 public Signature createSignature(String peerId, List<String> watchIds) {
   Map<String,Object> params = new HashMap<String,Object>();
   params.put("self_id",peerId);
   params.put("watch_ids",watchIds);

   try{
     Object result =  AVCloud.callFunction("sign",params);
     if(result instanceof Map){
       Map<String,Object> serverSignature = (Map<String,Object>) result;
       Signature signature = new Signature();
       signature.setSignature((String)serverSignature.get("signature"));
       signature.setTimestamp((Long)serverSignature.get("timestamp"));
       signature.setNonce((String)serverSignature.get("nonce"));
       return signature;
     }
   }catch(AVException e){
     throw (SignatureFactory.SignatureException) e;
   }
   return null;
 }

  @Override
  public Signature createConversationSignature(String convId, String peerId, List<String> targetPeerIds,String action){
   Map<String,Object> params = new HashMap<String,Object>();
   params.put("self_id",peerId);
   params.put("group_id",convId);
   params.put("group_peer_ids",targetPeerIds);
   params.put("action",action);

   try{
     Object result = AVCloud.callFunction("group_sign",params);
     if(result instanceof Map){
        Map<String,Object> serverSignature = (Map<String,Object>) result;
        Signature signature = new Signature();
        signature.setSignature((String)serverSignature.get("signature"));
        signature.setTimestamp((Long)serverSignature.get("timestamp"));
        signature.setNonce((String)serverSignature.get("nonce"));
        return signature;
     }
   }catch(AVException e){
     throw (SignatureFactory.SignatureException) e;
   }
   return null;
  }
}
```
{% endblock %}
