# Python 指南


## 介绍

LeanCloud 是一个完整的平台解决方案，为您的应用提供全方位的后端服务。我们的目标是让你不需要进行后端开发及服务器运维等工作就可以开发和发布成熟的应用。

对于熟悉 Python 的用户，我们提供了 Python 语言版本的 SDK ， 方便开发。

## 快速入门

建议您在阅读本文档之前，阅读我们提供的[快速入门](https://leancloud.cn/start.html)文档，获取 LeanCloud 使用的配置和第一印象。

## 使用 `pip` / `easy_install` 安装 Python SDK

您可以使用 `pip` 或者 `easy_install` 安装 Python SDK

```sh
pip install leancloud
```

or

```sh
easy_install leancloud
```

根据您的环境，命令之前可能还需要加上 `sudo` 。

另外，我们推荐您使用 `virtualenv` 来隔离 Python 环境。

## 配合 gevent 使用

Python SDK 使用 Python 内置网络连接库，所有的网络操作都是阻塞的。如果您的代码需要应对高并发场景，可以使用 gevent 来提高性能。

```python
from gevent import monkey

monkey.patch_all()  # 或者只 patch 指定的模块
```

请注意上述代码一定要在其他代码之前执行，比如说写在您的模块的 `__init__.py` 最前面。

关于 gevent 的详细介绍，可以 [gevent 官方文档](http://www.gevent.org/)。

另外如果您使用我们的云代码环境来运行 Python SDK，以上的步骤是不需要的，我们默认开启了 gevent 支持。

## 初始化

在调用 SDK 前，需要进行初始化。

```python
import leancloud

leancloud.init('APP_ID', 'APP_KEY/MASTER_KEY')
```

## 数据存储

### 对象

您可以通过子类化 `leancloud.Object` 来创建自己的类，使用此类生成对象再保存，将会将数据保存到 LeanCloud 数据服务上，类名对应的表中。

```python

from leancloud import Object

class GameScore(Object):
    def is_cheeted(self):
        # 可以像正常 Python 类一样定义方法
        return self.get('cheatMode')

    @property
    def score(self):
        # 可以使用property装饰器，方便获取属性
        return self.get('score')

    @score.setter
    def score(self, value):
        # 同样的，可以给对象的score增加setter
        return self.set('score', value)

# or: GameScore = Object.extend('GameScore')
```

#### 保存对象

调用实例对象的save方法，即可保存对象。

```python
game_score = GameScore()
game_score.set('score', 42)  # or game_score.score = 42
game_score.set('cheetMode', False)
game_score.set('playerName', 'Marvin')
game.save()

# 还可以通过关键字参数，在创建对象的同时进行赋值
game_score = GameScore(score=42, playerName='Marvin')
```

这时候登陆 LeanCloud 控制台查看，可以看到 GameScore 中新增一条数据。

另外所有 Object 子类对象，都有三个特殊字段，保存之后服务器会自动填充其中的数据。

```python
game_score.id            # => 此对象的id，类型为 unicode ，对应控制台的 objectId
game_score.created_at    # => 此对象创建的时间，类型为 datetime.datetime ，对应控制台的 createdAt
game_score.updated_at    # => 此对象最后更新的时间，类型为 datetime.datetime，对应控制台的 updatedAt
```

#### 检索对象

检索对象可以使用 leancloud.Query 类来进行。

如果事先知道一个对象的 objectId ，可以这样做:

```python
from leancloud import Query
query = Query(GameScore)
game_score = query.get('520ca0bbe4b07e8e0e847e31')
print game_score.get('playerName')
```

#### 更新对象

更新对象的时候，直接修改对象上对应字段的值，然后再调用`save`方法即可。

```python
from leancloud import Object
GameScore = Object.extend('GameScore')

game_score.set('score', 42)
game_score.set('cheetMode', False)
game_score.set('playerName', 'Marvin')
game.save()

game_score.set('score', 43)
game_score.save()
```

##### 计数操作

很多应用场景都需要进行一些计数操作，比如记录游戏分数，论坛帖子回帖数等等。如果直接从服务器获取这些字段的值，然后简单的加减值再进行保存，这个时候很有可能服务器上的数据已经有了更新，会将服务器的数据覆盖掉。这往往不是我们想要的结果。因此可以使用`increment`方法来进行计数操作，我们只需要将需要增减的值传递给服务器就可以了。

```python
from leancloud import Object
GameScore = Object.extend('GameScore')

game_score.set('score', 42)
game_score.set('cheetMode', False)
game_score.set('playerName', 'Marvin')
game_score.save()

game_score.increment('score', 1)
game_score.save()
```

##### 删除字段

有时候需要将对象上的一个字段设置为空，可以使用`unset`方法。

```python
game_score.unset('score')
game_score.save()
```

#### 删除对象

如果你想要删除服务器上的一个对象，可以使用`destroy`方法。

```python
game_score.destroy()
```

#### 关系数据

leancloud 后端存储支持一对一，一对多，多对多数据建模。

##### 一对一关系和一对多关系

一对一关系和一对多关系都可以通过在一个`Object`对象内保存另一个对象来实现。
