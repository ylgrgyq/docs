{# 指定继承模板 #}
{% extends "./leanstorage_guide.tmpl" %}

{# --Start--变量定义，主模板使用的单词，短语所有子模板都必须赋值 #}
{% set cloudName ="LeanCloud" %}
{% set productName ="LeanStorage" %}
{% set platform_title ="iOS / OS X" %}
{% set sdk_name ="iOS / OS X SDK" %}
{% set baseObjectName ="AVObject" %}
{% set objectIdName ="objectId" %}
{% set updatedAtName ="updatedAt" %}
{% set createdAtName ="createdAt" %}
{% set backgroundFunctionTemplate ="xxxxInBackground" %}
{% set saveEventuallyName ="saveEventually" %}
{% set deleteEventuallyName ="saveEventually" %}
{% set relationObjectName ="AVRelation" %}
{% set pointerObjectName ="AVPointer" %}
{% set baseQueryClassName ="AVQuery" %}
{% set geoPointObjectName ="AVGeoPoint" %}
{% set userObjectName ="AVUser" %}
{% set fileObjectName ="AVFile" %}
{% set dateType= "NSDate" %}
{% set byteType= "NSData" %}


{# --End--变量定义，主模板使用的单词，短语的定义所有子模板都必须赋值 #}

{# --Start--主模板留空的代码段落，子模板根据自身实际功能给予实现 #}

{% block code_create_todo_object %}

```objc
    // objectWithClassName 参数对应的就是控制台中的 Class Name
    AVObject *todo = [AVObject objectWithClassName:@"Todo"];
    // 也可以是用下面的方式调用实例方法来创建一个对象
    AVObject *todo = [[AVObject alloc] initWithClassName:@"Todo"];
    // 以上两行代码是完全等价的
```
{% endblock %}

{% block code_quick_save_a_todo %}

```objc
    AVObject *todo = [AVObject objectWithClassName:@"Todo"];
    [todo setObject:@"工程师周会" forKey:@"title"];
    [todo setObject:@"每周工程师会议，周一下午2点" forKey:@"content"];
    [todo saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
        if (succeeded) {
            // 存储成功
        } else {
            // 失败的话，请检查网络环境以及 SDK 配置是否正确
        }
    }];
```
{% endblock %}

{% block code_quick_save_a_todo_with_location %}

```objc
    AVObject *todo = [AVObject objectWithClassName:@"Todo"];
    [todo setObject:@"工程师周会" forKey:@"title"];
    [todo setObject:@"每周工程师会议，周一下午2点" forKey:@"content"];
    [todo setObject:@"会议室" forKey:@"location"];// 只要添加这一行代码，服务端就会自动添加这个字段
    [todo saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
        if (succeeded) {
            // 存储成功
        } else {
            // 失败的话，请检查网络环境以及 SDK 配置是否正确
        }
    }];
```
{% endblock %}

{% block text_sdk_setup_link %}我们提供了一个针对 iOS / OS X SDK 详细的安装指南：[LeanCloud iOS / OS X SDK 安装指南](sdk_setup-ios.html){% endblock %}

{% block code_save_todo_folder %}

```objc
    AVObject *todoFolder = [[AVObject alloc] initWithClassName:@"TodoFolder"];// 构建对象
    [todoFolder setObject:@"工作" forKey:@"name"];// 设置名称
    [todoFolder setObject:@1 forKey:@"priority"];// 设置优先级
    [todoFolder saveInBackground];// 保存到服务端
```
{% endblock %}

{% block code_get_todo_by_objectId %}

```objc
    AVQuery *query = [AVQuery queryWithClassName:@"Todo"];
    [query getObjectInBackgroundWithId:@"558e20cbe4b060308e3eb36c" block:^(AVObject *object, NSError *error) {
        // object 就是 id 为 558e20cbe4b060308e3eb36c 的 Todo 对象实例
    }];
```
{% endblock %}

{% block code_save_callback_get_objectId %}

```objc
    AVObject *todo = [AVObject objectWithClassName:@"Todo"];
    [todo setObject:@"工程师周会" forKey:@"title"];
    [todo setObject:@"每周工程师会议，周一下午2点" forKey:@"content"];
    [todo setObject:@"会议室" forKey:@"location"];// 只要添加这一行代码，服务端就会自动添加这个字段
    [todo saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
        if (succeeded) {
            // 存储成功
            NSLog(@"%@",todo.objectId);// 保存成功之后，objectId 会自动从服务端加载到本地
        } else {
            // 失败的话，请检查网络环境以及 SDK 配置是否正确
        }
    }];
```
{% endblock %}

{% block code_access_todo_folder_properties %}

```objc
    AVQuery *query = [AVQuery queryWithClassName:@"Todo"];
    [query getObjectInBackgroundWithId:@"558e20cbe4b060308e3eb36c" block:^(AVObject *object, NSError *error) {
        // object 就是 id 为 558e20cbe4b060308e3eb36c 的 Todo 对象实例
        int priority = [[object objectForKey:@"priority"] intValue];
        NSString *location = [object objectForKey:@"location"];
        NSString *title = object[@"title"];
        NSString *content = object[@"content"];
        
        // 获取三个特殊属性
        NSString *objectId = object.objectId;
        NSDate *updatedAt = object.updatedAt;
        NSDate *createdAt = object.createdAt;
    }];
```
{% endblock %}

{% block code_object_fetch %}

```objc
        // 假如已知了 objectId 可以用如下的方式构建一个 AVObject
        AVObject *anotherTodo = [AVObject objectWithoutDataWithClassName:@"Todo" objectId:@"5656e37660b2febec4b35ed7"];
        // 然后调用刷新的方法，将数据从服务端拉到本地
        [anotherTodo fetchIfNeededInBackgroundWithBlock:^(AVObject *object, NSError *error) {
            // 调用 fetchIfNeededInBackgroundWithBlock 和 refreshInBackgroundWithBlock 效果是一样的。
        }];
```
{% endblock %}

{% block code_object_fetch_with_keys %}

```objc
        AVObject *theTodo = [AVObject objectWithoutDataWithClassName:@"Todo" objectId:@"564d7031e4b057f4f3006ad1"];
        NSArray *keys = [NSArray arrayWithObjects:@"priority", @"content",nil];// 指定刷新的 key 数组
        [theTodo fetchInBackgroundWithKeys:keys block:^(AVObject *object, NSError *error) {
            // theTodo 的 location 和 content 属性的值就是与服务端一致的
            NSString *location = [object objectForKey:@"location"];
            NSString *content = object[@"content"];
        }];
```
{% endblock %}

{% block code_update_todo_location %}

```objc
    AVObject *todo = [AVObject objectWithClassName:@"Todo"];
    [todo setObject:@"工程师周会" forKey:@"title"];
    [todo setObject:@"每周工程师会议，周一下午2点" forKey:@"content"];
    [todo setObject:@"会议室" forKey:@"location"];
    [todo saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
        if (succeeded) {
            // 存储成功
            [todo setObject:@"二楼大会议室" forKey:@"location"];
            [todo saveInBackground];
        } else {
            // 失败的话，请检查网络环境以及 SDK 配置是否正确
        }
    }];
```
{% endblock %}

{% block code_atomic_operation_increment %}

```objc
    AVObject *theTodo = [AVObject objectWithoutDataWithClassName:@"Todo" objectId:@"564d7031e4b057f4f3006ad1"];
    [theTodo setObject:[NSNumber numberWithInt:0] forKey:@"views"]; //初始值为 0
    [theTodo saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
        // 原子增加查看的次数
        [theTodo incrementKey:@"views"];
        [theTodo saveInBackground];
        // 也可以使用 incrementKey:byAmount: 来给 Number 类型字段累加一个特定数值。
        [theTodo incrementKey:@"views" byAmount:@(5)];
    }];
```
{% endblock %}

{% block code_atomic_operation_array %}

* `addObject:forKey:`<br>
  `addObjectsFromArray:forKey:`<br>
  将指定对象附加到数组末尾。
* `addUniqueObject:forKey:`<br>
  `addUniqueObjectsFromArray:forKey:`<br>
  如果不确定某个对象是否已包含在数组字段中，可以使用此操作来添加。对象的插入位置是随机的。  
* `removeObject:forKey:`<br>
  `removeObjectsInArray:forKey:`<br>
  从数组字段中删除指定对象的所有实例。

{% endblock %}

{% block code_set_array_value %}

```objc
-(NSDate*) getDateWithDateString:(NSString*) dateString{
    NSDateFormatter *dateFormat = [[NSDateFormatter alloc] init];
    [dateFormat setDateFormat:@"yyyy-MM-dd HH:mm:ss"];
    NSDate *date = [dateFormat dateFromString:dateString];
    return date;
}

-(void)addReminders{
    NSDate *reminder1= [self getDateWithDateString:@"2015-11-11 07:10:00"];
    NSDate *reminder2= [self getDateWithDateString:@"2015-11-11 07:20:00"];
    NSDate *reminder3= [self getDateWithDateString:@"2015-11-11 07:30:00"];
    
    NSArray *reminders =[NSArray arrayWithObjects:reminder1, reminder1,reminder3, nil];// 添加提醒时间
    
    AVObject *todo = [AVObject objectWithClassName:@"Todo"];
    [todo addUniqueObjectsFromArray:reminders forKey:@"reminders"];
    [todo saveInBackground];
}
```
{% endblock %}

{% block code_delete_todo_by_objectId %}

```objc
    [todo deleteInBackground];
```
{% endblock %}

{% block code_relation_todoFolder_one_to_many_todo %}

```objc
    AVObject *todoFolder = [[AVObject alloc] initWithClassName:@"TodoFolder"];// 构建对象
    [todoFolder setObject:@"工作" forKey:@"name"];// 设置名称
    [todoFolder setObject:@1 forKey:@"priority"];// 设置优先级
    
    AVObject *todo1 = [[AVObject alloc] initWithClassName:@"Todo"];
    [todo1 setObject:@"工程师周会" forKey:@"title"];
    [todo1 setObject:@"每周工程师会议，周一下午2点" forKey:@"content"];
    [todo1 setObject:@"会议室" forKey:@"location"];
    
    AVObject *todo2 = [[AVObject alloc] initWithClassName:@"Todo"];
    [todo2 setObject:@"维护文档" forKey:@"title"];
    [todo2 setObject:@"每天 16：00 到 18：00 定期维护文档" forKey:@"content"];
    [todo2 setObject:@"当前工位" forKey:@"location"];
    
    AVObject *todo3 = [[AVObject alloc] initWithClassName:@"Todo"];
    [todo3 setObject:@"发布 SDK" forKey:@"title"];
    [todo3 setObject:@"每周一下午 15：00" forKey:@"content"];
    [todo3 setObject:@"SA 工位" forKey:@"location"];
    
    AVRelation *relation = [todoFolder relationforKey:@"containedTodos"];// 新建一个 AVRelation
    [relation addObject:todo1];
    [relation addObject:todo2];
    [relation addObject:todo3];
    // 上述 3 行代码表示 relation 关联了 3 个 Todo 对象
    
    [todoFolder saveInBackground];// 保存到云端
```
{% endblock %}

{% block code_pointer_user_one_to_many_todoFolder %}

```objc
    AVObject *todoFolder = [[AVObject alloc] initWithClassName:@"TodoFolder"];// 构建对象
    [todoFolder setObject:@"工作" forKey:@"name"];// 设置名称
    [todoFolder setObject:@1 forKey:@"priority"];// 设置优先级
    
    [todoFolder setObject:[AVUser currentUser] forKey:@"owner"];// 这里就是一个 Pointer 类型，指向当前登陆的用户
```

代码中提及的 `[AVUser currentUser]` 在后文的[用户->当前用户](#当前用户)会有介绍。
{% endblock %}

{% block code_data_type %}

```objc
NSNumber *boolean = @(YES);
NSNumber *number = [NSNumber numberWithInt:2014];
NSString *string = [NSString stringWithFormat:@"famous film name is %i", number];
NSDate *date = [NSDate date];
NSData *data = [@"fooBar" dataUsingEncoding:NSUTF8StringEncoding];
NSArray *array = [NSArray arrayWithObjects:string, number, nil]; // NSArray
NSDictionary *dictionary = [NSDictionary dictionaryWithObjectsAndKeys:number, @"number",string, @"string",nil];// NSDictionary

AVObject *testObject = [AVObject objectWithClassName:@"DataTypeTest"];
[testObject setObject:boolean    forKey:@"testBoolean"];
[testObject setObject:number     forKey:@"testInteger"];
[testObject setObject:string     forKey:@"testString"];
[testObject setObject:date       forKey:@"testDate"];
[testObject setObject:data       forKey:@"testData"];
[testObject setObject:array      forKey:@"testArray"];
[testObject setObject:dictionary forKey:@"testDictionary"];
[testObject saveInBackground];
```

到目前为止，我们使用过的数据类型有 NSString、 NSNumber、 AVObject，LeanCloud 还支持 NSDate 和 NSData。

此外，NSDictionary 和 NSArray 支持嵌套，这样在一个 AVObject 中就可以使用它们来储存更多的结构化数据。

我们**不推荐**在 `AVObject` 中使用 `NSData` 类型来储存大块的二进制数据，比如图片或整个文件。**每个 `AVObject` 的大小都不应超过 128 KB**。如果需要储存更多的数据，建议使用 `AVFile`。更多细节可以阅读本文 [文件](#文件) 部分。

若想了解更多有关 LeanStorage 如何解析处理数据的信息，请查看专题文档《[数据与安全](./data_security.html)》。
{% endblock %}

{% block code_create_geoPoint %}

``` objc
AVGeoPoint *point = [AVGeoPoint geoPointWithLatitude:39.9 longitude:116.4];
```
{% endblock %}

{% block code_use_geoPoint %}

``` objc
[todo setObject:point forKey:@"createdLocated"];
```
{% endblock %}

{% block code_serialize_baseObject_to_string %}

```objc
    AVObject *todoFolder = [[AVObject alloc] initWithClassName:@"TodoFolder"];// 构建对象
    [todoFolder setObject:@"工作" forKey:@"name"];// 设置名称
    [todoFolder setObject:@1 forKey:@"priority"];// 设置优先级
    [todoFolder setObject:[AVUser currentUser] forKey:@"owner"];// 这里就是一个 Pointer 类型，指向当前登陆的用户
    NSMutableDictionary *serializedJSONDictionary = [todoFolder dictionaryForObject];//获取序列化后的字典
    NSError * err;
    NSData * jsonData = [NSJSONSerialization dataWithJSONObject:serializedJSONDictionary options:0 error:&err];//获取 JSON 数据
    NSString *serializedString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];// 获取 JSON 字符串
    // serializedString 的内容是：{"name":"工作","className":"TodoFolder","priority":1} 

```

{% endblock %}

{% block code_deserialize_string_to_baseObject %}

```objc
    NSMutableDictionary *objectDictionary = [NSMutableDictionary dictionaryWithCapacity:10];// 声明一个 NSMutableDictionary
    [objectDictionary setObject:@"工作" forKey:@"name"];
    [objectDictionary setObject:@1 forKey:@"priority"];
    [objectDictionary setObject:@"TodoFolder" forKey:@"className"];
    
    AVObject *todoFolder = [AVObject objectWithDictionary:objectDictionary];// 由 NSMutableDictionary 转化一个 AVObject
    
    [todoFolder saveInBackground];// 保存到服务端
```
{% endblock %}


{% block code_data_protocol_save_date %}{% endblock %}

{% block code_create_avfile_by_stream_data %}

```objc
    NSData *data = [@"Working with LeanCloud is great!" dataUsingEncoding:NSUTF8StringEncoding];
    AVFile *file = [AVFile fileWithName:@"resume.txt" data:data];
```
{% endblock %}

{% block code_create_avfile_from_local_path %}

```objc
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *documentsDirectory = [paths objectAtIndex:0];
    NSString *leanclouImagePath = [documentsDirectory stringByAppendingPathComponent:@"LeanCloud.png"];
    AVFile *file = [AVFile fileWithName:fileName contentsAtPath:leanclouImagePath];
```
{% endblock %}

{% block code_create_avfile_from_url %}

```objc
    AVFile *file =[AVFile fileWithURL:@"http://ww3.sinaimg.cn/bmiddle/596b0666gw1ed70eavm5tg20bq06m7wi.gif"];
    [file getData];// 注意这一步很重要，这是把图片从原始地址拉去到本地
```
{% endblock %}

{% block code_upload_file %}

```objc
    [file saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
        NSLog(IshiharaSatomi.url);//返回一个唯一的 Url 地址
    }];
```
{% endblock %}

{% block code_upload_file_with_progress %}

```objc
    [file saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
      // 成功或失败处理...
    } progressBlock:^(int percentDone) {
      // 上传进度数据，percentDone 介于 0 和 100。
    }];
```
{% endblock %}

{% block code_downlod_file %}

```objc
    [file getDataInBackgroundWithBlock:^(NSData *data, NSError *error) {
        // data 就是文件的数据流
    } progressBlock:^(NSInteger percentDone) {
        //下载的进度数据，percentDone 介于 0 和 100。
    }];
```
{% endblock %}

{% block code_create_query_by_className %}

```objc
AVQuery *query = [AVQuery queryWithClassName:@"Todo"];
```
{% endblock %}

{% block text_create_query_by_avobject %}{% endblock %}

{% block code_create_query_by_avobject %}

```objc

```
{% endblock %}

{% block code_priority_equalTo_zero_query %}

```objc
    AVQuery *query = [AVQuery queryWithClassName:@"Todo"];
    [query whereKey:@"priority" equalTo:@0];
    [query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
        NSArray<AVObject *> *priorityEqualsZeroTodos = objects;// 符合 priority = 0 的 Todo 数组
    }];
```
{% endblock %}

{% block table_logic_comparison_in_query %}
逻辑操作 | AVQuery 方法|
---|---
等于 | `equalTo`
不等于 |  `notEqualTo` 
大于 | `greaterThan`
大于等于 | `greaterThanOrEqualTo` 
小于 | `lessThanOrEqualTo`
小于等于 | `lessThanOrEqualTo`
{% endblock %}

{% block code_query_lessThan %}

```objc
[query whereKey:@"priority" lessThan:@2];
```
{% endblock %}

{% block code_query_greaterThanOrEqualTo %}

```objc
[query whereKey:@"priority" greaterThanOrEqualTo:@2];
```
{% endblock %}

{% block code_query_with_regular_expression %}

```objc
    AVQuery *query = [AVQuery queryWithClassName:@"Todo"];
    [query whereKey:@"title" matchesRegex:@"[\u4e00-\u9fa5]"];
```
{% endblock %}

{% block code_query_with_contains_keyword %}

```objc
    AVQuery *query = [AVQuery queryWithClassName:@"Todo"];
    [query whereKey:@"title" containsString:@"李总"];
```
{% endblock %}

{% block code_query_with_not_contains_keyword_using_regex %}

```objc

```
{% endblock %}

{% block code_query_with_not_contains_keyword %}

```objc
    AVQuery *query = [AVQuery queryWithClassName:@"Todo"];
    NSArray *filterArray = [NSArray arrayWithObjects:@"出差", @"休假", nil]; // NSArray
    [query whereKey:@"title" notContainedIn:filterArray];
    [query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
        NSArray<AVObject *> *nearTodos = objects;// 离这个位置最近的 10 个 Todo 对象
    }];
```
{% endblock %}

{% block code_query_array_contains_using_equalsTo %}{% endblock %}

{% block code_query_array_contains_all %}{% endblock %}

{% block code_create_family_with_tag %}{% endblock %}

{% block code_query_tag_for_todoFolder %}{% endblock %}

{% block code_query_todoFolder_with_tag %}{% endblock %}

{% block code_query_with_or %}{% endblock %}

{% block code_query_with_and %}{% endblock %}

{% block code_query_find_first_object %}

```objc

```
{% endblock %}

{% block code_set_query_limit %}

```objc
    AVQuery *query = [AVQuery queryWithClassName:@"Todo"];\
    NSDate* now = [NSDate date];
    [query whereKey:@"createdAt" lessThanOrEqualTo:now];//查询今天之前创建的 Todo
    query.limit = 10; // 最多返回 10 条结果
```
{% endblock %}

{% block code_set_skip_for_pager %}

```objc
    AVQuery *query = [AVQuery queryWithClassName:@"Todo"];
    NSDate* now = [NSDate date];
    [query whereKey:@"createdAt" lessThanOrEqualTo:now];//查询今天之前创建的 Todo
    query.limit = 10; // 最多返回 10 条结果
    query.skip = 20;  // 跳过 20 条结果
```

{% endblock %}

{% block code_query_count %}

```objc
    AVQuery *query = [AVQuery queryWithClassName:@"Todo"];
    [query whereKey:@"status" equalTo:@"1"];
    [query countObjectsInBackgroundWithBlock:^(NSInteger number, NSError *error) {
        if (!error) {
            // 查询成功，输出计数
            NSLog(@"今天 发布了 %ld 条微博", number);
        } else {
            // 查询失败
        }
    }];
```

{% endblock %}

{% block code_query_by_cql %}

```objc
    NSString *cql = [NSString stringWithFormat:@"select * from %@ where status = 1", @"Todo"];
    AVCloudQueryResult *result = [AVQuery doCloudQueryWithCQL:cql];
    NSLog(@"results:%@", result.results);

    cql = [NSString stringWithFormat:@"select count(*) from %@ where priority = 0", @"Todo"];
    result = [AVQuery doCloudQueryWithCQL:cql];
    NSLog(@"count:%lu", (unsigned long)result.count);
```
{% endblock %}

{% block code_query_by_cql_with_placeholder %}

```objc
    NSString *cql = [NSString stringWithFormat:@"select * from %@ where status = ? and priority = ?", @"Todo"];
    NSArray *pvalues =  @[@0, @1];
    [AVQuery doCloudQueryInBackgroundWithCQL:cql pvalues:pvalues callback:^(AVCloudQueryResult *result, NSError *error) {
        if (!error) {
            // 操作成功
        } else {
            NSLog(@"%@", error);
        }
    }];
```
{% endblock %}

{% block code_set_cache_policy %}

```objc
  AVQuery *query = [AVQuery queryWithClassName:@"Post"];
  query.cachePolicy = kAVCachePolicyNetworkElseCache;

  //设置缓存有效期
  query.maxCacheAge = 24*3600;

  [query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
    if (!error) {
      // 成功找到结果，先找网络再访问磁盘
    } else {
      // 无法访问网络，本次查询结果未做缓存
    }
  }];
```
{% endblock %}

{% block table_cache_policy %}

策略枚举 | 含义及解释|
---|---
`kAVCachePolicyIgnoreCache ` | **（默认缓存策略）**查询行为不从缓存加载，也不会将结果保存到缓存中。
`kAVCachePolicyCacheOnly` |  查询行为忽略网络状况，只从缓存加载。如果没有缓存结果，该策略会产生 `AVError`。 
`kAVCachePolicyCacheElseNetwork` |  查询行为首先尝试从缓存加载，若加载失败，则通过网络加载结果。如果缓存和网络获取行为均为失败，则产生 `AVError`。
`kAVCachePolicyNetworkElseCache` | 查询行为先尝试从网络加载，若加载失败，则从缓存加载结果。如果缓存和网络获取行为均为失败，则产生 `AVError`。 
`kAVCachePolicyCacheThenNetwork` | 查询先从缓存加载，然后从网络加载。在这种情况下，回调函数会被调用两次，第一次是缓存中的结果，然后是从网络获取的结果。因为它会在不同的时间返回两个结果，所以该策略不能与 `findObjects` 同时使用。
{% endblock %}

{% block code_cache_opration %}

* 检查是否存在缓存查询结果：
  
  ``` objc
  BOOL isInCache = [query hasCachedResult];
  ```
  
* 删除某一查询的任何缓存结果：
  
  ``` objc
  [query clearCachedResult];
  ```
  
* 删除查询的所有缓存结果：
  
  ``` objc
  [AVQuery clearAllCachedResults];
  ```
  
* 设定缓存结果的最长时限：
  
  ``` objc
  query.maxCacheAge = 60 * 60 * 24; // 一天的总秒数
  ```

查询缓存也适用于 `AVQuery` 的辅助方法，包括 `getFirstObject` 和 `getObjectInBackground`。
{% endblock %}

{% block code_query_geoPoint_near %}

```objc
    AVQuery *query = [AVQuery queryWithClassName:@"Todo"];
    AVGeoPoint *point = [AVGeoPoint geoPointWithLatitude:39.9 longitude:116.4];
    query.limit = 10;
    [query whereKey:@"createdLocated" nearGeoPoint:point];
    [query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
        NSArray<AVObject *> *nearTodos = objects;// 离这个位置最近的 10 个 Todo 对象
    }];
```

在上面的代码中，`nearPosts` 返回的是与 `userLocation` 这一点按距离排序（由近到远）的对象数组。注意：**如果在此之后又使用了 `orderByAscending:` 或 `orderByDescending:` 方法，则按距离排序会被新排序覆盖。**
{% endblock %}

{% block text_platform_geoPoint_notice %}
* iOS 8.0 之后，使用定位服务之前，需要调用 `[locationManager requestWhenInUseAuthorization]` 或 `[locationManager requestAlwaysAuthorization]` 来获取用户的「使用期授权」或「永久授权」，而这两个请求授权需要在 `info.plist` 里面对应添加 `NSLocationWhenInUseUsageDescription` 或 `NSLocationAlwaysUsageDescription` 的键值对，值为开启定位服务原因的描述。SDK 内部默认使用的是「使用期授权」。
{% endblock %}

{% block code_query_geoPoint_within %}

```objc
    [query whereKey:@"createdLocated"  nearGeoPoint:point withinKilometers:2.0];
```
{% endblock %} code_object_fetch_with_keys

{% block link_to_in_app_search_doc %}[iOS / OS X 应用内搜索指南](in_app_search_guide-ios.html){% endblock %}
{% block link_to_acl_doc %}[iOS / OS X 权限管理使用指南](acl_guide-ios.html){% endblock %}

{% block link_to_relation_guide_doc %}[iOS / OS X 关系建模指南](relation_guide-ios.html){% endblock %}

{% block link_to_sms_guide_doc %}[iOS / OS X 短信服务使用指南](sms_guide-ios.html#注册验证){% endblock %}

{% block code_user_signUp_with_username_and_password %}

```objc
    AVUser *user = [AVUser user];// 新建 AVUser 对象实例
    user.username = @"Tom";// 设置用户名
    user.password =  @"cat!@#123";// 设置密码
    user.email = @"tom@leancloud.cn";// 设置邮箱
    
    [user signUpInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
        if (succeeded) {
            // 注册成功
        } else {
            // 失败的原因可能有多种，常见的是用户名已经存在。
        }
    }];
```
{% endblock %}

{% block code_user_logIn_with_username_and_password %}

```objc
  [AVUser logInWithUsernameInBackground:@"Tom" password:@"cat!@#123" block:^(AVUser *user, NSError *error) {
      if (user != nil) {

      } else {

      }
  }];
```
{% endblock %}

{% block code_user_logIn_with_mobilephonenumber_and_password %}

```objc
    [AVUser logInWithMobilePhoneNumberInBackground:@"13888888888" password:@"cat!@#123" block:^(AVUser *user, NSError *error) {
        
    }];
```
{% endblock %}

{% block code_user_logIn_requestLoginSmsCode %}

```objc
    [AVUser requestLoginSmsCode:@"13888888888" withBlock:^(BOOL succeeded, NSError *error) {
        
    }];
```
{% endblock %}

{% block code_user_logIn_with_smsCode %}

```objc
    [AVUser logInWithMobilePhoneNumberInBackground:@"13888888888" smsCode:@"238825" block:^(AVUser *user, NSError *error) {
        
    }];
```
{% endblock %}

{% block code_get_user_properties %}{% endblock %}

{% block code_set_user_custom_properties %}{% endblock %}

{% block code_update_user_custom_properties %}{% endblock %}

{% block code_reset_password_by_email %}

``` objc
[AVUser requestPasswordResetForEmailInBackground:@"myemail@example.com" block:^(BOOL succeeded, NSError *error) {
    if (succeeded) {

    } else {

    }
}];
```
{% endblock %}

{% block code_reset_password_by_mobilephoneNumber %}

``` objc
[AVUser requestPasswordResetWithPhoneNumber:@"18612340000" block:^(BOOL succeeded, NSError *error) {
    if (succeeded) {

    } else {

    }
}];
```
{% endblock %}

{% block code_reset_password_by_mobilephoneNumber_verify %}

``` objc
[AVUser resetPasswordWithSmsCode:@"123456" newPassword:@"password" block:^(BOOL succeeded, NSError *error) {
    if (succeeded) {

    } else {

    }
}];
```
{% endblock %}

{% block code_current_user %}{% endblock %}

{% block code_query_user %}{% endblock %}

{% block text_subclass %}
## 子类化
子类化推荐给进阶的开发者在进行代码重构的时候做参考。
你可以用 `AVObject` 访问到所有的数据，用 `objectForKey:` 获取任意字段。 在成熟的代码中，子类化有很多优势，包括降低代码量，具有更好的扩展性，和支持自动补全。

子类化是可选的，请对照下面的例子来加深理解：

``` 
AVObject *student = [AVObject objectWithClassName:@"Student"];
[student setObject:@"小明" forKey:@"name"];
[student saveInBackground];
```

可改写成:

``` 
Student *student = [Student object];
student.name = @"小明";
[student saveInBackground];
```

这样代码看起来是不是更简洁呢？

### 子类化的实现

要实现子类化，需要下面几个步骤：

1. 导入 `AVObject+Subclass.h`；
2. 继承 `AVObject` 并实现 `AVSubclassing` 协议；
3. 实现类方法 `parseClassName`，返回的字符串是原先要传给 `initWithClassName:` 的参数，这样后续就不必再进行类名引用了。如果不实现，默认返回的是类的名字。**请注意： `AVUser` 子类化后必须返回 `_User`**；
4. 在实例化子类之前调用 `[YourClass registerSubclass]`（**在应用当前生命周期中，只需要调用一次**，所以建议放在 `ApplicationDelegate` 中，在 `[AVOSCloud setApplicationId:clientKey:]` 之前调用即可）。

下面是实现 `Student` 子类化的例子:

``` objc
  //Student.h
  #import <AVOSCloud/AVOSCloud.h>

  @interface Student : AVObject <AVSubclassing>

  @property(nonatomic,copy) NSString *name;

  @end


  //Student.m
  #import "Student.h"

  @implementation Student

  @dynamic name;

  + (NSString *)parseClassName {
      return @"Student";
  }

  @end


  // AppDelegate.m
  #import <AVOSCloud/AVOSCloud.h>
  #import "Student.h"

  - (BOOL)application:(UIApplication *)application
  didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    [Student registerSubclass];
    [AVOSCloud setApplicationId:appid clientKey:appkey];
  }
```

### 属性

为 `AVObject` 的子类添加自定义的属性和方法，可以更好地将这个类的逻辑封装起来。用 `AVSubclassing` 可以把所有的相关逻辑放在一起，这样不必再使用不同的类来区分业务逻辑和存储转换逻辑了。

`AVObject` 支持动态 synthesizer，就像 `NSManagedObject` 一样。先正常声明一个属性，只是在 .m 文件中把 `@synthesize` 变成 `@dynamic`。

请看下面的例子是怎么添加一个「年龄」属性：

``` objc
  //Student.h
  #import <AVOSCloud/AVOSCloud.h>

  @interface Student : AVObject <AVSubclassing>

  @property int age;

  @end


  //Student.m
  #import "Student.h"

  @implementation Student

  @dynamic age;

  ......
```

这样就可以通过 `student.age = 19` 这样的方式来读写 `age` 字段了，当然也可以写成：

``` objc
[student setAge:19]
```

**注意：属性名称保持首字母小写！**（错误：`student.Age` 正确：`student.age`）。

`NSNumber` 类型的属性可用 `NSNumber` 或者是它的原始数据类型（`int`、 `long` 等）来实现。例如， `[student objectForKey:@"age"]` 返回的是 `NSNumber` 类型，而实际被设为 `int` 类型。

你可以根据自己的需求来选择使用哪种类型。原始类型更为易用，而 `NSNumber` 支持 `nil` 值，这可以让结果更清晰易懂。

**注意** 子类中，对于 `BOOL` 类型的字段，SDK 在 3.1.3.2 之前会将其保存为 Number 类型，3.1.3.2 之后将其正确保存为 Bool 类型。详情请参考[这里](https://leancloud.cn/docs/ios_os_x_faq.html#为什么升级到_3_1_3_2_以上的版本时_BOOL_类型数据保存错误_)。

注意：`AVRelation` 同样可以作为子类化的一个属性来使用，比如：

``` objc
@interface Student : AVUser <AVSubclassing>
@property(retain) AVRelation *friends;
  ......
@end

@implementation Student
@dynamic friends;
  ......
```

另外，值为 Pointer 的实例可用 `AVObject*` 来表示。例如，如果 `Student` 中 `bestFriend` 代表一个指向另一个 `Student` 的键，由于 Student 是一个 AVObject，因此在表示这个键的值的时候，可以用一个 `AVObject*` 来代替：

``` objc
@interface Student : AVUser <AVSubclassing>
@property(nonatomic, strong) AVObject *bestFriend;
 ......
@end

@implementation Student
@dynamic bestFriend;
  ......
```

提示：当需要更新的时候，最后都要记得加上 `[student save]` 或者对应的后台存储函数进行更新，才会同步至服务器。

如果要使用更复杂的逻辑而不是简单的属性访问，可以这样实现:

``` objc
  @dynamic iconFile;

  - (UIImageView *)iconView {
    UIImageView *view = [[UIImageView alloc] initWithImage:kPlaceholderImage];
    view.image = [UIImage imageNamed:self.iconFile];
    return [view autorelease];
  }

```

### 针对 AVUser 子类化的特别说明

假如现在已经有一个基于 `AVUser` 的子类，如上面提到的 `Student`:

``` objc
@interface Student : AVUser<AVSubclassing>
@property (retain) NSString *displayName;
@end


@implementation Student
@dynamic displayName;
+ (NSString *)parseClassName {
    return @"_User";
}
@end
```

登录时需要调用 `Student` 的登录方法才能通过 `currentUser` 得到这个子类:

``` objc
[Student logInWithUsernameInBackground:@"USER_NAME" password:@"PASSWORD" block:^(AVUser *user, NSError *error) {
        Student *student = [Student currentUser];
        student.displayName = @"YOUR_DISPLAY_NAME";
    }];
```

同样需要调用 `[Student registerSubclass];`，确保在其它地方得到的对象是 Student，而非 AVUser 。

### 初始化子类

创建一个子类实例，要使用 `object` 类方法。要创建并关联到已有的对象，请使用 `objectWithoutDataWithObjectId:` 类方法。

### 子类查询

使用类方法 `query` 可以得到这个子类的查询对象。

例如，查询年龄小于 21 岁的学生：

``` objc
  AVQuery *query = [Student query];
  [query whereKey:@"age" lessThanOrEqualTo:@(21)];
  [query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
    if (!error) {
      Student *stu1 = [objects objectAtIndex:0];
      // ...
    }
  }];
```
{% endblock %}
{# --End--主模板留空的代码段落，子模板根据自身实际功能给予实现 #}

