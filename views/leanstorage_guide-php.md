{# 指定继承模板 #}
{% extends "./leanstorage_guide.tmpl" %}

{# --Start--变量定义，主模板使用的单词，短语所有子模板都必须赋值 #}
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

{% block code_save_todo_folder %}{% endblock %}

{% block code_get_todo_by_objectId %}{% endblock %}

{% block code_save_callback_get_objectId %}{% endblock %}

{% block code_access_todo_folder_properties %}{% endblock %}

{% block code_update_todo_location %}{% endblock %}

{% block code_fetch_todo_when_save %}{% endblock %}

{% block code_atomic_operation_increment %}{% endblock %}

{% block code_set_array_value %}{% endblock %}

{% block code_delete_todo_folder_by_objectId %}{% endblock %}

{% block code_relation_todoFolder_one_to_many_todo %}{% endblock %}

{% block code_pointer_user_one_to_many_todoFolder %}{% endblock %}

{% block table_data_type %}{% endblock %}

{% block code_serialize_baseObject_to_string %}{% endblock %}

{% block code_deserialize_string_to_baseObject %}{% endblock %}

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

```
{% endblock %}

{% block code_create_query_by_avobject %}

```objc

```
{% endblock %}

{% block code_priority_equalTo_zero_query %}{% endblock %}

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

{% block code_query_lessThan %}{% endblock %}

{% block code_query_greaterThanOrEqualTo %}{% endblock %}

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

{% block code_query_with_not_contains_keyword %}notContainedIn{% endblock %}

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

{% block link_to_in_app_search_doc %}[iOS / OS X 应用内搜索指南](in_app_search_guide-ios.html){% endblock %}
{% block link_to_acl_doc %}[iOS / OS X 权限管理使用指南](acl_guide-ios.html){% endblock %}

{% block link_to_relation_guide_doc %}[iOS / OS X 关系建模南](relation_guide-ios.html){% endblock %}

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

{% block code_query_user %}{% endblock %}


{% block text_query_cache_intro %}{% endblock %}
{# --End--主模板留空的代码段落，子模板根据自身实际功能给予实现 #}

