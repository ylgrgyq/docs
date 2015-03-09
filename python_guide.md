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

一对一关系和一对多关系都可以通过在一个`Object`对象内保存另一个对象来实现。比如一个`Post`下可以允许多个`Comment`对象，一个`Comment`只能属于一个`Post`对象，可以这样实现：

```python
Post = Object.extend('Post')
Comment = Object.extend('Comment')

post = Post()
post.set('title', 'I am Hungry')
post.set('content', 'Where should we go for lunch?')

comment = Comment()
comment.set('content', 'Let us do Sushirrito.')

comment.set('parent', post)

comment.save()
```

在父对象上调用`save`方法，SDK 会同时保存两个对象。

如果想将一个已经保存在了服务器上的对象关联到新对象上，可以只通过现有对象的 `objectId` 来进行关联。

```python
post = Post()
post.id = '520c7e1ae4b0a3ac9ebe326a'
# or: post = Post.createWithouData('520c7e1ae4b0a3ac9ebe326a')
comment.set('parent', post)
```

默认情况下，从服务器上获取一个对象时并不会获取与它关联对象的值。可以这样显式获取：

```python
post = comment.get('parent')
post.fetch()
```

#### 多对多关系

多对多关系可以使用 `leancloud.Relation` 来建立。比如 `User` 可以将 `Post` 添加进自己 `like` 的列表中，可以这样实现：

```python
relation = user.relation('likes')
relation.add(post)
user.save()
```

可以在 `likes` 中删除一个 `post`:

```python
relation = user.relation('likes')
relation.remove(post)
user.save()
```

`relation` 中关联的对象并不会下载到本地。可以用 `query` 方法来返回一个 `leancloud.Query` 对象，来获取 `relation` 中的对象列表，比如：

```python
relation = user.relation('likes')
query = relation.query()
posts = query.find()
```

此时 `query` 对象即是 `leancloud.Query` 的实例，可以增加一些查询条件，比如：

```python
relation = user.relation('likes')
query = relation.query().equal_to('title', 'I am Hungry')
posts = query.find()
```

如果想查询所有 like 了某个 Post 的用户，可以使用 `reverse_query` 方法来进行返乡查询：

```python
from leancloud import Relation

query = Relation.reverse_query('User', 'likes', post)
users = query.find()
```

#### 数据类型

LeanCloud Python SDK 支持大部分 Python 内置类型。

```python
from datetime import datetime
from leancloud import Object

obj = Object.extend('myObject')()
obj.set('myNumber', 2.718)
obj.set('myString', 'foobar')
obj.set('myDate', datetime.now())
obj.set('myArray', [1, 2, 3, 4])
obj.set('myDict', {'string': 'some string', 'number': 1})
obj.set('myNone', None)
obj.save()
```

需要注意的是，Object 对象序列化之后的大小不应该超过 128KB。

### 查询

#### 基础查询

我们可以通过构造 `leancloud.Query` 对象，来进行复杂查询。

```python
from leancloud import Object
from leancloud import Query

GameScore = Object.extend('GameScore')
query = Query(GameScore)  # 这里也可以直接传递一个 Class 名字的字符串作为构造参数
query.equal_to('playerName', 'Dan Stemkoski')
gameScores = query.find()
```

#### 查询条件

有几种方式来设置查询条件。 你可以用 notEqual 方法和一个特定的值来过滤不符合要求的对象:

```python
query.not_equal_to("playerName", "Michael Yabuti")
```

你可以给定更多的条件, 只有满足所有条件的对象才会作为结果返回。

```python
query.not_equal_to("playerName", "Michael Yabuti")
query.greater_than("playerAge", 18)
```

你可以用设定 limit 的方法来限定返回的结果数, 默认的返回结果数是 100, 但是任何 1 到 1000 之间的数值都是合法的，在 0 到 1000 范围之外的都强制转成默认的 100。

```python
query.limit(10) # limit to at most 10 results
```

如果你只想要一个结果, 一个更加方便的方法可能是使用 first, 而不是 find 方法。

```python
GameScore = Object.extend('GameScore')
query = Query(GameScore)
query.equal_to('playerEmail', 'dstemkoski@example.com')
gameScore = query.first()
```

你可以用 skip 跳过前面的结果, 这可能对于分页很有用。

```python
query.skip(10)  # skip the first 10 results
```

对于可以排序的类型, 比如 int 和 str, 你可以控制返回结果的顺序:

```python
# Sorts the results in ascending order by the score field
query.ascending("score")

# Sorts the results in descending order by the score field
query.descending("score")
```

对于可以排序的类型, 你同样可以在查询中进行比较。

```python
# Restricts to wins < 50
query.less_than("wins", 50)

# Restricts to wins <= 50
query.less_than_or_equalTo("wins", 50)

# Restricts to wins > 50
query.greater_than("wins", 50)

# Restricts to wins >= 50
query.greater_than_or_equal_to("wins", 50)
```

如果想让返回的对象的某个属性匹配多个值, 你可以使用 contained_in, 提供一个数组就可以了。这样通常可以用单个的查询来获取多个结果。比如你想获取某几个玩家的分数:

```python
# Finds scores from any of Jonathan, Dario, or Shawn
query.contained_in("playerName", ["Jonathan Walsh", "Dario Wunsch", "Shawn Simon"])
```

相反地，你可以使用 notContainedIn 方法来查询在集合之外的目标对象。

如果你想要查询含有某一特定属性的对象, 你可以使用 exists。相对地, 如果你想获取没有这一特定属性的对象, 你可以使用 `does_not_exist`。

```python
# Finds objects that have the score set
query.exists("score")

# Finds objects that don't have the score set
query.does_not_exist("score")

你可以使用 `matches_key_in_query` 方法来进行嵌套的子查询。举例说, 如果你有一个类包含了运动队, 而你在用户的类中存储了用户的家乡信息, 你可以构造一个查询来查找某地的运动队有赢的记录的用户。查询应该看起来像下面这样:

```python
from leancloud import Object
from leancloud import Query
from leancloud import User

Team = Object.extend("Team")
team_query = Query(Team)
team_query.greater_than("winPct", 0.5)
user_query = Query(User)
user_query.matches_key_in_query("hometown", "city", team_query)

# results has the list of users with a hometown team with a winning record
results = user_query.find()
```

相对地, 可以使用 `does_not_match_key_in_query` 来获取属性不在子查询结果中的对象。比如为了获得用户的家乡队输了的情况:

```python
losing_user_query = Query(User)
losing_user_query.does_not_match_key_in_query("hometown", "city", teamQuery)

# results has the list of users with a hometown team with a losing record
results = losingUserQuery.find()
```

你可以用 select 和一个 keys 的列表来限定返回的字段。为了获得只包含 score 和 playername 字段的文档 ( 包括 build-in 的字段,objectId,createdAt, updatedAt):

```python
GameScore = Object.extend("GameScore")
query = Query(GameScore)
query.select("score", "playerName")

# each of results will only have the selected fields available.
results = query.find()
```

剩下的字段可以之后用返回的对象的 fetch 方法来获取:

```python
result = query.first().fetch()
```

#### 对数组值做查询

对于 value 是数组的情况, 你可以这样查询数组中的值有 2 的情况的对象:

```python
# Find objects where the array in arrayKey contains 2.
query.equal_to("arrayKey", 2)
```

你同样可以用下面的方式找到同时包含元素 2,3,4 的数组:

```python
# Find objects where the array in arrayKey contains all of the elements 2, 3, and 4.
query.contains_all("arrayKey", [2, 3, 4])
```

#### 对字符串类型做查询

使用 start_with 来限制属性值以一个特定的字符串开头，这和 MySQL 的 LIKE 操作 符很像, 因为有索引所以对于大的数据集这个操作也是很高效的.

```python
# Finds barbecue sauces that start with "Big Daddy's".
query = leancloud.Query(BarbecueSauce);
query.starts_with("name", "Big Daddy's");
```

#### 关系查询

对于查询关系型数据来说有几种不同的方式, 如果你想要获取的对象中有某个属性 包含一个特定的 leancloud.Object, 你可以使用 equal_to, 就像对于别的数据类型一样. 举个例子, 如果每一个 Comment 在它的 post 字段都有一个 Post 对象, 你可以通过 如下的方式来获取一个 Post 的 comment:

```python
# Assume leancloud.Object my_post was previously created.
query = leancloud.Query(Comment)
query.equal_to("post", my_post)
comments = query.find()
# comments now contains the comments for my_post
```

如果你想得到其字段中包含的子对象满足另一个查询的结果, 你可以使用 matches_query 操作. 注意默认的结果条数限制 100 和最大 limit 1000 也同样适用于子查询, 所以对于大的数据集你可能需要小心构建你的查询, 否则可能出现意料之外的状况。例如，为了找到 post 中有图片的 comment, 你可以:

```python
inner_query = leancloud.Query(Post)
inner_query.exists("image")
query = leancloud.Query(Comment)
query.matches_query("post", inner_query)
comments = query.find()
# comments now contains the comments for posts with images.
```

如果你想要获取某字段中包含的子对象不满足指定查询的结果, 你可以使用 does_not_match_query. 例如，为了找到针对不含图片的 post 的 comment, 你可以这样:

```python
inner_query = leancloud.Query(Post)
inner_query.exists("image")
query = leancloud.Query(Comment)
query.does_not_match_query("post", inner_query)
query.find()
# comments now contains the comments for posts without images.
```

你可以同样用 objectId 来做关系查询

```python
post = Post()
post.id = "520c7e1ae4b0a3ac9ebe326a"
query.equal_to("post", post)
```

在某些情况下, 你可能希望查询结果中包含多个相关联的其他数据类型。你可以使用 include 方法. 比如: 假设你想获得最新的 10 个 comment, 你可能想同时获取它们相关的 post 数据:

```python
query = leancloud.Query(Comment)

# Retrieve the most recent ones
query.descending("createdAt")

# Only retrieve the last ten
query.limit(10)

# Include the post data with each comment
query.include("post")

comments = query.find()
# Comments now contains the last ten comments, and the "post" field
# has been populated. For example:
for comment in comments:
    # This does not require a network access.
    post = comment.get("post")
```

你同样可以用点操作符来做多级查询, 如果你想同时找到 comment 的 post 和相应 post 的 author, 你可以这样做:

```python
query.include(["post.author"])
```

你可以多次使用 include 来构建一个有多个字段的查询, 这项功能同样适用于 leancloud.Query 的 helper 函数例如 first 和 get。

#### 对象计数
``
如果你只是想查询满足一个 query 的结果集到底有多少对象, 但是你不需要得到它们, 你可以使用 count 来取代 find. 比如, 为了获得某个玩家到底玩过多少局游戏:

```python
query = leancloud.Query(GameScore)
query.equal_to("playerName", "Sean Plott")
count = query.count(){
# The count request succeeded. Show the count
print "Sean has played %d games" % count
```

对于超过 1000 个对象的类来说，count 操作会被时间限制所约束。它们可能会一直 返回超时错误，或者只是返回一个近似正确的值. 这样的话你应该更合理地规划你程序的结构来避免这种情况。

#### 组合查询

如果你想要查找满足一系列查询的对象, 你可以使用 leancloud.Query.or 方法来构建查询, 这样得到的结果是所有查询的并集。比如你想要找的玩家或者是有很多或者很少的胜利的时候, 你可以这样:

```python
lots_of_wins = leancloud.Query("Player")
lots_of_wins.greater_than("wins", 150)

few_wins = leancloud.Query("Player")
few_wins.less_than("wins", 5)

main_query = leancloud.Query.or(lots_of_wins, few_wins)
results = mainQuery.find({
# results contains a list of players that either have won a lot of games or won only a few games.
```

你也可以对 AV.Query 加入更多的条件，如同 AND 查询一样，这样得到所有查询结果的交集。

请注意我们不会在组合查询的子查询中支持非过滤型的条件 (比如:limit,skip,ascending/descending,include)。
