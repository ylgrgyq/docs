# 离线数据分析使用指南

## 简介

针对大规模数据的分析任务一般都比较耗时。LeanCloud 为开发者提供了 SQL-like 的离线数据分析功能。想要获得这项功能，开发者只需要设置 `启用离线数据分析` 这个[应用选项](/data.html?appid={{appid}}#/permission)。离线数据分析的数据来源是每日备份数据，不会对应用的线上数据产生任何影响。

## 启用离线数据分析

为了启用离线数据分析，开发者需要在[应用选项](/data.html?appid={{appid}}#/permission)中勾选 `启用离线数据分析`。该选选一旦被设置，LeanCloud 会为开发者准备离线数据，这个过程一般会消耗一分钟或更多时间。如果一切顺利，你可以通过 `控制台 -> 应用 -> 数据 -> 选择某个 Class -> 其他 -> 离线数据分析` 这个路径进入离线数据分析页面。如果不能正常使用，请通过 ticket 联系我们的工程师。

## SQL-like 查询分析

LeanCloud 目前支持 HiveQL 的功能子集，常用的 HiveQL 功能都能正常使用，例如：

* Hive 查询语法，包括：

	* SELECT 
	* GROUP BY
	* ORDER BY
	* CLUSTER BY
	* SORT BY	

* 所有 Hive 运算符，包括：
	* 关系运算符（=, ⇔, ==, <>, <, >, >=, <=, etc）
	* 算术运算符（+, -, *, /, %, etc）
	* 逻辑运算符（AND, &&, OR, ||, etc）
	* 数学函数（COUNT, SUM, AVG, etc） 
	* 字符串函数（STRING, SUBSTRING, etc）

* 多表 Join：
	* JOIN
	* {LEFT|RIGHT|FULL} OUTER JOIN
	* LEFT SEMI JOIN
	* CROSS JOIN

* 子查询
	* SELECT col FROM ( SELECT a + b AS col from t1) t2

* 大多数 Hive 数据类型，包括：
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

* 一些 SQL-like 数据分析例子

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
	
	select * from GameScore group by name
	
	```

