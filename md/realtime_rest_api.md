#实时通信 REST API

## 通过 REST API 创建、更新、删除对话数据

你可以通过 REST API 对对话（相应的聊天室、群组或单聊等）进行操作，例如提前创建聊天室，关联聊天室到其他数据实体。LeanCloud 实时通信系统采用透明的设计，对话数据在 LeanCloud 系统中是普通的数据表，表名为 `_Conversation`，你可以直接调用[数据存储相关的 API 进行数据操作](./rest_api.html#%E5%AF%B9%E8%B1%A1-1)。`_Conversation` 包含一些内置的关键字段定义了对话的属性、成员等，你可以在[这里](./realtime_v2.html#%E5%AF%B9%E8%AF%9D_Conversation_)了解。

##获取聊天记录

获取某个应用的聊天记录

```sh
curl -X GET \
  -H "X-AVOSCloud-Application-Id: {{appid}}" \
  -H "X-AVOSCloud-Application-Key: {{appkey}}" \
  https://leancloud.cn/1.1/rtm/messages/logs
```

参数 | 含义
--- | ---
convid | 对话 id
max_ts | 查询起始的时间戳，返回小于这个时间(不包含)的记录。可选，默认是当前时间
limit | 返回条数限制，可选，默认100条，最大1000条
peerid | 查看者id（签名参数）
nonce | 签名随机字符串（签名参数）
signature_ts | 签名时间戳（签名参数）
signature | 签名时间戳（签名参数）

为了保证获取聊天记录的安全性，可以开启签名认证（应用选项：聊天记录签名认证）。了解更详细的签名规则请参考[聊天签名方法](realtime.html#签名方法)。签名参数仅在开启应用选项后有效，如果没有开启选项，就不需要传签名参数。

签名采用 Hmac-sha1 算法，输出字节流的十六进制字符串 (hex dump)，签名的 key 必须是应用的 master key ,签名的消息格式如下：

`appid:peerid:convid:nonce:signature_ts`

返回数据格式，json 数组，按消息记录从新到旧排序。

```json
[
  {
    timestamp: 1408008498571,
    conv-id: "219946ef32e40c515d33ae6975a5c593",
    data: "今天天气不错！",
    app-id: "ndxxv7lefvpj7z9jk4hh6o686790i8mxgxmf27da7vr6767s"
    from: "u111872755_9d0461adf9c267ae263b3742c60fa"
  },
  ...
]
```

返回字段说明：

字段名 | 含义
--- | ---
conv-id | 用于查询的对话 id
from | 消息来自 id
data | 消息内容
timestamp | 消息到达服务器的 Unix 时间戳，毫秒
msg-id | 消息 id
is-conv | 是否是 v2 中对话模型的消息
is-room | 是否是早期版本中的群组消息
to | 早期版本中的收件人列表
bin | 是否是 BASE64 编码的二进制内容
from-ip | 消息的来源 IP

## 删除聊天记录
删除一条指定的聊天历史记录，必须采用 master key 授权，所以不建议在客户端使用此接口

```sh
curl -X DELETE \
  -H "X-AVOSCloud-Application-Id: {{appid}}" \
  -H "X-AVOSCloud-Master-Key: {{masterkey}}" \
  https://leancloud.cn/1.1/rtm/messages/logs?convid=219946ef32e40c515d33ae6975a5c593&msgid=PESlY&timestamp=1408008498571
```

参数名 | 含义
--- | ---
convid | 对话 id
msgid | 消息 id
timestamp | 消息时间戳

### 构建对话 ID

实时通信中的 `convid` 构建规则：

* 目前版本中，convid 即对话 ID。
* 对早期版本来说：
  * 对点对点通信，convid 为所有对话参与者的 peer id **排序**后以`:`分隔，做 md5 所得。如对话参与者 peer id 为 `u1234` 和 `u0988`，那么对话 ID 为 `bcd26a54e98687390b0abb4d83683d4b`。
  * 对群组功能，convid 即群组 ID。

## 取未读消息数

您可以从服务器端通过 REST API 调用获取实时通信中，某个 Client ID 的未读消息数。

```sh
curl -X GET \
  -H "X-AVOSCloud-Application-Id: {{appid}}" \
  -H "X-AVOSCloud-Application-Key: {{appkey}}" \
  https://leancloud.cn/1.1/rtm/messages/unread/CLIENT_ID
```

返回：

```json
{"count": 4}
```

## 通过 REST API 向用户发消息

我们目前提供 REST API 允许向指定用户发送消息。您可以一个已有对话发送消息。

```sh
curl -X POST \
  -H "X-AVOSCloud-Application-Id: {{appid}}" \
  -H "X-AVOSCloud-Master-Key: {{masterkey}}" \
  -H "Content-Type: application/json" \
  -d '{"from_peer": "1a", "message": "helloworld", "conv_id": "...", "transient": false}' \
  https://leancloud.cn/1.1/rtm/messages
```

参数说明：

参数名 | 含义
--- | ---
from_peer | 消息的发件人 id
conv_id | 发送到对话 id
transient | 是否为暂态消息（可选，**由于向后兼容的考虑，默认为 true**，请注意设置这个值）
message | 消息内容（这里的消息内容的本质是字符串，但是我们对字符串内部的格式没有做限定，理论上开发者可以随意发送任意格式，只要大小不超过限制即可）

对早期版本的实时通信，可以使用 `to_peers` （数组） 或 `group_id` 参数分别发消息到用户或群组。

### 富媒体消息格式说明
富媒体消息的参数格式相对于普通文本来说，仅仅是将 `message` 参数换成了一个 JSON **字符串**（注意：由于 LeanCloud 实时通信中所有的消息都是文本，所以这里发送 JSON 结构时需要首先序列化成字符串）。

#### 文本消息

```
curl -X POST \
  -H "X-AVOSCloud-Application-Id: {{appid}}" \
  -H "X-AVOSCloud-Master-Key: " \
  -H "Content-Type: application/json" \
  -d '{"from_peer": "1a", "message": "{\"_lctype\":-1,\"_lctext\":\"这是一个纯文本消息\",\"_lcattrs\":{\"a\":\"_lcattrs 是用来存储用户自定义的一些键值对"\}}", "conv_id": "...", "transient": false}' \
  https://leancloud.cn/1.1/rtm/messages
```

发送文本消息可以按照以上的格式进行，参数说明：

参数名 | 含义
--- | ---
_lctype | 富媒体消息的类型，文本消息默认为 -1，图像默认为 -2，音频默认为 -3，视频默认为 -4，通用文件默认为 -6，地理位置消息为 -5
_lctext | 富媒体消息的文字说明
_lcattrs | JSON 字符串，用来给开发者存储自定义属性
_lcfile | 如果是包含了文件（图像，音频，视频，通用文件）的消息 ，_lcfile 就包含了它的文件实体的相关信息
url | 文件在上传之后的物理地址
objId | 文件对应的在 `_File` 表里面的 objectId （可选）
metaData | 文件的元数据 （可选）

**以上参数针对所有富媒体消息都有效**

#### 图像消息

在新版本的聊天中，支持了内建的富媒体消息格式，以下针对 整个消息体 JSON 格式化之后的参数说明，例如如下的图像消息：

```
  {
    "_lctype": -2,//必要参数
    "_lctext": "图像的文字说明",
    "_lcattrs": {
      "a": "_lcattrs 是用来存储用户自定义的一些键值对",
      "b": true,
      "c": 12
    },
    "_lcfile": {
      "url": "http://ac-p2bpmgci.clouddn.com/246b8acc-2e12-4a9d-a255-8d17a3059d25",//必要参数
      "objId": "54699d87e4b0a56c64f470a4//文件对应的AVFile.objectId",
      "metaData": {
        "name": "IMG_20141223.jepg",//图像的名称
        "format": "png",//图像的格式
        "height": 768,//单位：像素
        "width": 1024,//单位：像素
        "size": 18//单位：b
      }
    }
  }
```


以上是完整版的格式，如果想简单的发送一个 URL 可以参照以下格式：

```
  {
    "_lctype": -2,
    "_lcfile": {
      "url": "http://ac-p2bpmgci.clouddn.com/246b8acc-2e12-4a9d-a255-8d17a3059d25"
    }
  }
```

#### 音频消息

与图像类似，音频格式的完整格式如下：

```
  {
    "_lctype": -3,
    "_lctext": "这是一个音频消息",
    "_lcattrs": {
      "a": "_lcattrs 是用来存储用户自定义的一些键值对"
    },
    "_lcfile": {
      "url": "http://ac-p2bpmgci.clouddn.com/246b8acc-2e12-4a9d-a255-8d17a3059d25",
      "objId": "54699d87e4b0a56c64f470a4//文件对应的AVFile.objectId",
      "metaData": {
        "name":"我的滑板鞋.wav",
        "format": "wav",
        "duration": 26,//单位：秒
        "size": 2738//单位：b
      }
    }
  }
```

简略版：

```
  {
    "_lctype": -3,
    "_lcfile": {
      "url": "http://www.somemusic.com/x.mp3"
    }
  }
```

#### 视频消息

完整版：

```
  {
    "_lctype": -4,
    "_lctext": "这是一个视频消息",
    "_lcattrs": {
      "a": "_lcattrs 是用来存储用户自定义的一些键值对"
    },
    "_lcfile": {
      "url": "http://ac-p2bpmgci.clouddn.com/99de0f45-171c-4fdd-82b8-1877b29bdd12",
      "objId": "54699d87e4b0a56c64f470a4//文件对应的AVFile.objectId",
      "metaData": {
        "name":"录制的视频.mov",
        "format": "avi",
        "duration": 168,//单位：秒
        "size": 18689//单位：b
      }
    }
  }
```

简略版：

```
  {
    "_lctype": -4,
    "_lcfile": {
      "url": "http://www.somevideo.com/Y.flv"
    }
  }
```

#### 通用文件消息

```
  {
    "_lctype":-6,
    "_lctext":"这是一个普通文件类型",
    "_lcattrs": {
      "a": "_lcattrs 是用来存储用户自定义的一些键值对"
    },
    "_lcfile":{
      "url": "http://www.somefile.com/jianli.doc",
      "name":"我的简历.doc",
      "size": 18689//单位：b
    }
  }
```

简略版：

```
  {
    "_lctype":-6,
    "_lcfile":{
      "url": "http://www.somefile.com/jianli.doc",
      "name":"我的简历.doc"
    }
  }
```

#### 地理位置消息

```
  {
    "_lctype": -5,
    "_lctext": "这是一个地理位置消息",
    "_lcattrs": {
      "a": "_lcattrs 是用来存储用户自定义的一些键值对"
    },
    "_lcloc": {
      "longitude": 23.2,
      "latitude": 45.2
    }
  }
```

简略版：

```
  {
    "_lctype": -5,
    "_lcloc": {
      "longitude": 23.2,
      "latitude": 45.2
    }
  }
```

## 获取暂态对话的在线人数

你可以通过这个 API 获得暂态对话的在线人数。由于暂态对话没有成员列表支持，所以通常使用这个 API 获得当前的在线人数。

参数名 | 含义
--- | ---
gid | 暂态对话的 id

```sh
curl -X GET \
  -H "X-AVOSCloud-Application-Id: {{appid}}" \
  -H "X-AVOSCloud-Application-Key: {{appkey}}" \
  https://leancloud.cn/1.1/rtm/transient_group/onlines?gid=...
```

返回：

```json
{"result":0}
```

这个 API 也可以用于获取早期版本开放群组的在线人数。
