# LeanCache 指南

## 介绍

LeanCache 使用 Redis 来提供高性能、高可用的 Key-Value 内存存储。主要用作持久化数据的存储，也可以用作缓存数据的存储。

## 主要特性

* 高性能：接近 7万 的 QPS
* 高可用：Master-Slave 热备，AOF 持久化
* 在线扩容：在线调整容量，数据平滑迁移
* 多节点：满足更大容量或更高性能的需求

## 创建实例

打开 LeanCache 控制台页面，TODO

创建实例时可选参数：

* 实例名称：不填则为随即字符串。**注意**：每个应用下 LeanCache 实例名称必须唯一。
* 最大容量：可选 32MB，64MB，128MB 等，最大 8GB。
* 删除策略：当内存满时对 key 的删除策略，默认是 'noeviction'，如果实例作为缓存使用，可以选择 'volatile-lru'，详细内容请参考 [Using Redis as an LRU cache](http://redis.io/topics/lru-cache)。**注意**：该属性后期不可修改。

## 使用

LeanCache 目前支持 LeanEngine 访问。实例创建完毕后，LeanEngine 应用就可以从环境变量中获取 `REDIS_URL_<实例名称>` 的 Redis 连接字符串，通过该信息连接并使用 Redis。

LeanCache 不提供外网直接访问。如果需要简单的数据操作或状态查看，可以使用 [命令行工具](cloud_code_commandline.html)。

### 在 LeanEngine 中使用（Node.js 环境）

首先添加相关依赖到 LeanEngine 应用中：

```
"dependencies": {
  ...
  "redis": "0.12.x",
  ...
}
```

然后可以使用下列代码获取 Redis 连接：

```
var client = require('redis').createClient(process.env['REDIS_URL_<实例名称>']);
```

### 在 LeanEngine 中使用（Python 环境）

首先添加相关依赖到 LeanEngine 应用中：

```
TODO
```

然后可以使用下列代码获取 Redis 连接：

```
import os
import redis

r = redis.from_url(os.environ.get("REDIS_URL_<实例名称>"))
```

### 在 LeanEngine 中使用（旧版云代码环境）

旧版云代码环境不支持 LeanCache，建议升级到 LeanEngine 3.0 Node.js 环境，升级文档详见 [LeanEngine 2.0 升级 3.0 指南](leanengine_upgrade_3.html)。

### 在命令行工具中使用

**提示**：[命令行工具](cloud_code_commandline.html) 在 v0.8.0 增加了 redis 命令来支持 LeanCache 的操作。

可以通过下列命令查询当前应用有哪些 LeanCache 实例：

```
avoscloud redis list
```

可以通过下列命令创建一个交互式的 client：

```
avoscloud redis <实例名称>
```

## 性能

下面是使用 redis-benchmark 测试一个典型的容量为 512MB 的 LeanCache 实例的性能表现：

```
$ redis-benchmark -n 100000 -q
PING_INLINE: 69783.67 requests per second
PING_BULK: 68306.01 requests per second
SET: 68634.18 requests per second
GET: 67659.00 requests per second
INCR: 67294.75 requests per second
LPUSH: 61236.99 requests per second
LPOP: 62460.96 requests per second
SADD: 63451.78 requests per second
SPOP: 64724.92 requests per second
LPUSH (needed to benchmark LRANGE): 64808.82 requests per second
LRANGE_100 (first 100 elements): 62189.05 requests per second
LRANGE_300 (first 300 elements): 64267.35 requests per second
LRANGE_500 (first 450 elements): 66934.41 requests per second
LRANGE_600 (first 600 elements): 61462.82 requests per second
MSET (10 keys): 60096.15 requests per second
```

## 可靠性

LeanCache 实例使用 Redis Master-Slave 主从热备。有多个观察节点每隔几秒钟观察一次主节点的状态，如果过半观察节点发现主节点失效，则自动将从节点切换为主节点，并会有新的从节点启动重新组成主从热备。这个过程对 LeanEngine 应用完全透明，不需要修改连接字符串或者重启应用，整个切换过程应用只有几秒钟 Redis 不可用。

于此同时，从节点还将数据以 AOF 的方式持久化到可靠的中央文件存储，每秒刷新一次。如果很不巧主从节点同时失效，则马上会有新的 Redis 节点启动，并从 AOF 文件恢复，完成后即可再次提供服务，并且会有新的从节点与之构成主从热备。

### 极端情况下的数据丢失

当主节点失效，而最新的数据没有同步到从节点时，主从切换会造成这部分数据丢失。

当主从节点同时失效，未同步到从节点，和从节点未刷新到磁盘 AOF 文件的数据将会丢失。

## 在线扩容

你可以在线扩大（或者缩小） LeanCache 实例的最大内存容量。整个过程可能会持续一段时间，在此期间 Redis 会中断几秒钟进行切换，其他时间都正常提供服务。

**注意**：缩小容量之前，请务必确认现有数据体积小于目标容量，否则可能造成意料之外的结果。

## 多节点

有些时候，你可能希望在一个应用里创建多个 LeanCache 实例：

* 你需要存储的数据大于 8GB：因为我们当前提供的实例最大容量为 8GB，所以如果你有更多的数据，我们建议你创建多个实例，然后根据功能来划分，比如一个用来做持久化，另一个用来做缓存
* 你需要更高的性能：如果单实例的性能已经成为你应用的瓶颈，你可以创建多个实例，然后在 LeanEngine 同时连接，并自己决定 key 的分片策略，使请求分散到不同的实例来达到更高的性能。

## 价格方案

LeanCache 不同容量节点的价格详见 TODO。

**注意**：LeanCache 实例是按照「最大容量」收费，而不是「实际使用容量」。

购买实例是以一个月（30 天）作为一个计费单元实时结算。期间如果产生容量变更，则首先返还当前节点剩余金额，然后以新的容量开始一个付费单元并实时结算。

比如：

> 为了计算方便，我们假设 128MB 实例一个月 30 元，256MB 实例一个月 60 元。
> 
> 6 月 1 日购买了 LeanCache 128MB 实例，实时扣费 30 元，该实例使用周期为 6 月 1 日至 7 月 1 日。
> 
> 6 月 11 日将容量扩容到 256MB，则之前 128MB 实例未使用的时间（11 日至次月 1 日）折算为金额（20 元）返还给账户，并扣费 60 元用来支付新的容量，使用周期为 6 月 11 日至 7 月 11 日。