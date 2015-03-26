# 离线数据分析使用指南

## 简介

针对大规模数据的分析任务一般都比较耗时。LeanCloud 为开发者提供了 SQL-like 的离线数据分析功能。想要获得这项功能，开发者只需要设置 `启用离线数据分析` 这个[应用选项](/data.html?appid={{appid}}#/permission)。离线数据分析的数据来源是每日备份数据，不会对应用的线上数据产生任何影响。

## 启用离线数据分析

为了启用离线数据分析，开发者需要在[应用选项](/data.html?appid={{appid}}#/permission)中勾选 `启用离线数据分析`。该选选一旦被设置，LeanCloud 会为开发者准备离线数据，这个过程一般会消耗一分钟或更多时间。如果一切顺利，你可以通过 `存储 -> 离线数据分析` 这个路径进入离线数据分析页面。如果不能正常使用，请通过 [工单系统](https://ticket.avosapps.com) 联系我们的工程师。

## SQL-like 查询分析

LeanCloud 的离线数据分析服务基于 Spark SQL，目前支持 HiveQL 的功能子集，常用的 HiveQL 功能都能正常使用，例如：

### Hive 查询语法，包括：

* SELECT
* GROUP BY
* ORDER BY
* CLUSTER BY
* SORT BY

**针对 `GROUP BY` 的特别说明**：

有不少用户都有过 MySQL 的使用经验，这里主要是列举几种在 MySQL 中可用而在我们的服务（基于 Spark SQL）中却会报错的 `GROUP BY` 用法。

* SELECT * FROM table GROUP BY columnA;
	* MySQL：如果 columnA 这个字段有 10 种不同的值，那么这条查询语句得到的结果应该包含 10 行记录。
	* Spark SQL：如果 table 只有 columnA 这个字段，那么查询结果和 MySQL 相同。相反，如果 table 包含不止 columnA 这个字段，查询会报错。

* SELECT columnB FROM table GROUP BY columnA;
	* MySQL：同前一条查询差不多，返回正确结果。结果记录数由 columnA 值的种类决定。
	* Spark SQL：一定会报错。

当且仅当 SELECT 后面的表达式（expressions）为聚合函数（aggregation function）或包含 GROUP BY 中的字段，Spark SQL 的查询才会合法。列举几个常见的合法查询：

* SELECT columnA, count(columnB) as `count` FROM table GROUP BY columnA
* SELECT columnA, count(*) as `count` FROM table GROUP BY columnA
* SELECT columnA, columnB FROM table GROUP BY columnA, columnB

### 所有 Hive 运算符，包括：

* 关系运算符（=, ⇔, ==, <>, <, >, >=, <=, etc）
* 算术运算符（+, -, *, /, %, etc）
* 逻辑运算符（AND, &&, OR, ||, etc）
* 数学函数（sign, ln, cos, round, floor, ceil, exp, rand, sqrt, etc）
* 字符串函数（instr, length, printf, etc）
* 日期函数（unix_timestamp, from_unixtime, to_date, weekofyear, year, month, day, current_timestamp, etc）

### 常用的UDF
#### 计算类

* 取整函数: round
* 指定精度取整函数: round
* 向下取整函数: floor
* 向上取整函数: ceil
* 向上取整函数: ceiling
* 取随机数函数: rand
* 自然指数函数: exp
* 以10为底对数函数: log10
* 以2为底对数函数: log2
* 对数函数: log
* 幂运算函数: pow
* 幂运算函数: power
* 开平方函数: sqrt
* 二进制函数: bin
* 十六进制函数: hex
* 反转十六进制函数: unhex
* 进制转换函数: conv
* 绝对值函数: abs
* 正取余函数: pmod
* 正弦函数: sin
* 反正弦函数: asin
* 余弦函数: cos
* 反余弦函数: acos
* positive函数: positive
* negative函数: negative

#### 日期类

* UNIX时间戳转日期函数: from_unixtime
* 获取当前UNIX时间戳函数: unix_timestamp 
* 日期转UNIX时间戳函数: unix_timestamp 
* 指定格式日期转UNIX时间戳函数: unix_timestamp 
* 日期时间转日期函数: to_date 
* 日期转年函数: year 
* 日期转月函数: month 
* 日期转天函数: day 
* 日期转小时函数: hour 
* 日期转分钟函数: minute 
* 日期转秒函数: second 
* 日期转周函数: weekofyear 
* 日期比较函数: datediff 
* 日期增加函数: date_add 
* 日期减少函数: date_sub

更详尽的 Hive 运算符和内置函数，可以参考[这里](https://cwiki.apache.org/confluence/display/Hive/LanguageManual+UDF#LanguageManualUDF-Built-inOperators)

### 多表 Join：

* JOIN
* {LEFT|RIGHT|FULL} OUTER JOIN
* LEFT SEMI JOIN
* CROSS JOIN

### 子查询

* SELECT col FROM ( SELECT a + b AS col from t1) t2

### 大多数 Hive 数据类型，包括：

* TINYINT
* SMALLINT
* INT
* BIGINT
* BOOLEAN
* FLOAT
* DOUBLE
* STRING
* BINARY
* TIMESTAMP
* ARRAY<>
* MAP<>
* STRUCT<>

详细信息请参考 [Spark SQL Supported Hive Features](http://spark.apache.org/docs/latest/sql-programming-guide.html#supported-hive-features)

不支持的 Hive 功能可以参考 [Spark SQL Unsupported Hive Functionality](http://spark.apache.org/docs/latest/sql-programming-guide.html#unsupported-hive-functionality)

### 一些 SQL-like 数据分析例子

* 简单的 SELECT 查询

```
	select * from GameScore

	select count(*) from _User

```

* 复杂的 SELECT 查询

```
	select * from GameScore where createdAt > '2014-12-10'

	select avg(age) from _User

	select GameScore.objectId from GameScore left join _User where _User.name=GameScore.name limit 10

	select * from _User where name in (select name form OtherUser)

	select sum(score) from GameScore

	select count(*) as `count` from GameScore group by name

```

更多例子可以参考这篇[博客](https://blog.leancloud.cn/2559/)
