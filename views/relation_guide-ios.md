{% extends "./relation_guide.tmpl" %}

{% set platform = 'iOS / OS X' %}

{% block code_city_point_to_province %}

```objc
    AVObject *GuangZhou = [[AVObject alloc] initWithClassName:@"City"];// 广州
    [GuangZhou setObject:@"name" forKey:@"广州"];

    AVObject *GuangDong = [[AVObject alloc] initWithClassName:@"Province"];// 广东
    [GuangDong setObject:@"name" forKey:@"广东"];
    
    [GuangZhou setObject:GuangDong forKey:@"dependent"];// 为广州设置 dependent 属性为广东

    [GuangZhou saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
        if (succeeded) {
            {
                // 广州被保存成功
            }
        }
    }];
    // 广东无需被单独保存，因为在保存广州的时候已经上传到服务端。
```
{% endblock %}

{% block code_city_point_to_province_with_objectId %}

```objc
    // 假设 GuangDong 的 objectId 为 56545c5b00b09f857a603632
    AVObject *GuangDong = [AVObject objectWithoutDataWithClassName:@"Province" objectId:@"56545c5b00b09f857a603632"];    
    AVObject *DongGuan = [[AVObject alloc] initWithClassName:@"City"];// 东莞
    [DongGuan setObject:@"name" forKey:@"东莞"];
    
    [DongGuan setObject:GuangDong forKey:@"dependent"];// 为东莞设置 dependent 属性为广东
```

{% endblock %}
{% block code_fetch_province_by_city %}

```objc
    // 假设东莞作为 City 对象存储的时候它的 objectId 是 568e743c00b09aa22162b11f，这个  objectId 可以在控制台查看
    AVObject *DongGuan = [AVObject objectWithoutDataWithClassName:@"City" objectId:@"568e743c00b09aa22162b11f"];
    NSArray *keys = [NSArray arrayWithObjects:@"dependent", nil];
    [DongGuan fetchInBackgroundWithKeys:keys block:^(AVObject *object, NSError *error) {
         // 获取广东省
         AVObject *province = [object objectForKey:@"dependent"];
    }];
```
{% endblock %}
{% block code_query_province_by_city %}

```objc
    AVQuery *query = [AVQuery queryWithClassName:@"City"];
    
    // 查询名字是广州的城市
    [query whereKey:@"name" equalTo:@"广州"];
    
    // 找出对应城市的省份
    [query includeKey:@"dependent"];
    
    [query findObjectsInBackgroundWithBlock:^(NSArray *cities, NSError *error) {
        // cities 的结果为 name 等于广州的城市的集合，当然我们知道现实中只存在一个广州市
        for (AVObject *city in cities) {
            // 并不需要网络访问
            // 获取对应的省份
            AVObject *province = [city objectForKey:@"dependent"];
        }
    }];
```

{% endblock %}

{% block code_query_city_by_province %}

```objc
    // 假设 GuangDong 的 objectId 为 56545c5b00b09f857a603632
    AVObject *GuangDong = [AVObject objectWithoutDataWithClassName:@"Province" objectId:@"56545c5b00b09f857a603632"];
    
    AVQuery *query = [AVQuery queryWithClassName:@"City"];
    
    [query whereKey:@"dependent" equalTo:GuangDong];
    
    [query findObjectsInBackgroundWithBlock:^(NSArray *cities, NSError *error) {
        for (AVObject *city in cities) {
             // cities 的结果为广东省下辖的所有城市
        }
    }];
```
{% endblock %}
{% block code_save_cityList_array %}

```objc
    AVObject *GuangDong = [[AVObject alloc] initWithClassName:@"Province"];// 广东
    [GuangDong setObject:@"name" forKey:@"广东"];
    
    AVObject *GuangZhou = [[AVObject alloc] initWithClassName:@"City"];// 广州
    [GuangZhou setObject:@"name" forKey:@"广州"];

    AVObject *ShenZhen = [[AVObject alloc] initWithClassName:@"City"];// 深圳
    [ShenZhen setObject:@"name" forKey:@"深圳"];

    // 把广州和深圳放置在一个数组里面，然后把这个数组设置为广东的 cityList 属性
    [GuangDong addUniqueObjectsFromArray:[NSArray arrayWithObjects:GuangZhou, ShenZhen, nil] forKey:@"cityList"];
    
    // 只要保存 GuangDong 即可，它关联的对象都会一并被保存在服务端。
    [GuangDong saveInBackground];
```

{% endblock %}

{% block code_get_cityList_array %}{% endblock %}

{% block code_query_province_include_cityList %}{% endblock %}

{% block code_query_province_by_city_with_containsIn %}{% endblock %}

{% block code_save_student_related_to_course_with_relation %}{% endblock %}

{% block code_save_course_related_to_student_with_relation %}{% endblock %}

{% block code_query_student_by_course %}{% endblock %}

{% block code_query_courses_by_student %}{% endblock %}

{% block code_save_relationTable_student_with_course %}{% endblock %}

{% block code_query_relationTable_students_in_course %}{% endblock %}

{% block code_query_relationTable_courses_by_student %}{% endblock %}

{% block code_save_courses_using_arrays %}{% endblock %}

{% block code_query_courses_by_include %}{% endblock %}

{% block code_query_using_array_contains %}{% endblock %}