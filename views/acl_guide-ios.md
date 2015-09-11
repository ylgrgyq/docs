{% extends "./acl_guide.tmpl" %}

{% block create_post_set_acl_for_single_user %}

```objc
    // 新建一个帖子对象
    AVObject *post = [AVObject objectWithClassName:@"Post"];
    [post setObject:@"大家好，我是新人" forKey:@"title"];
    
    //新建一个 ACL 实例
    AVACL *acl = [AVACL ACL];
    [acl setPublicReadAccess:YES];// 设置公开的「读」权限，任何人都可阅读
    [acl setWriteAccess:YES forUser:[AVUser currentUser]];// 为当前用户赋予「写」权限，有且仅有当前用户可以修改这条 Post
    post.ACL = acl;// 将 ACL 实例赋予 Post对象
    
    [post saveInBackground];
```

{% endblock %}

{% block create_post_set_acl_for_othter_user %}

```objc
    AVQuery *query = [AVUser query];
    [query whereKey:@"objectId" equalTo:@"55f1572460b2ce30e8b7afde"];
    [query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
        if (error == nil) {
            // 新建一个帖子对象
            AVObject *post = [AVObject objectWithClassName:@"Post"];
            [post setObject:@"这是我的第二条发言，谢谢大家！" forKey:@"title"];
            [post setObject:@"我最近喜欢看足球和篮球了。" forKey:@"content"];
            
            //新建一个 ACL 实例
            AVACL *acl = [AVACL ACL];
            [acl setPublicReadAccess:YES];// 设置公开的「读」权限，任何人都可阅读
            [acl setWriteAccess:YES forUser:[AVUser currentUser]];// 为当前用户赋予「写」权限
            
            AVUser *othterUser = [objects objectAtIndex:0];// 读取 admin
            [acl setWriteAccess:YES forUser:othterUser];
            
            post.ACL = acl;// 将 ACL 实例赋予 Post 对象
            
            [post saveInBackground];
            
        } else {
            NSLog(@"error");
        }
    }];
```
{% endblock %}

{% block create_role_administrator %}

```
    // 新建一个角色，并把为当前用户赋予该角色
    AVRole *administrator =[AVRole roleWithName:@"Administrator"];//新建角色
    [[administrator users] addObject: [AVUser currentUser]];//为当前用户赋予该角色
    [administrator saveInBackground];//保存
```
{% endblock %}

{% block query_role_administrator %}

```
    // 构建角色的查询，并且查看该角色所对应的用户
    AVQuery *roleQuery= [AVRole query];
    [roleQuery whereKey:@"name" equalTo:@"Administrator"];
    [roleQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
        AVRole *administrator=[objects objectAtIndex:0];
        AVRelation *userRelation =[administrator users];
        AVQuery *userQuery= [userRelation query];
        [userQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
            // objects 就是拥有该角色权限的所有用户了。
        }];
    }];
```
{% endblock %}

{% block query_role_of_user %}

```
    AVQuery *roleQuery= [AVRole query];
    [roleQuery whereKey:@"users" equalTo: [AVUser currentUser]];
    [roleQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
        // objects 就是一个 AVRole 的数组，这些 AVRole 就是当前用户所在拥有的角色
    }];
```
{% endblock %}

{% block query_user_of_role %}

```
    AVRole *moderatorRole=//根据 id 查询或者根据 name 查询出一个实例
    AVRelation *userRelation =[moderatorRole users];
    AVQuery *userQuery= [userRelation query];
    [userQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
        // objects 就是拥有 moderatorRole 角色的所有用户了。
    }];
```
{% endblock %}

{% block add_role_for_user %}

```
    AVQuery *roleQuery= [AVRole query];
    [roleQuery whereKey:@"name" equalTo:@"Moderator"];
    [roleQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
        // 如果角色存在
        if ([objects count] > 0) {
            AVRole *moderatorRole= [objects objectAtIndex:0];
            [roleQuery whereKey:@"users" equalTo:[AVUser currentUser]];
            [roleQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error){
                if ([objects count] == 0) {
                    //为用户赋予角色
                    [[moderatorRole users ] addObject:[AVUser currentUser]];
                    [moderatorRole saveInBackground];
                } else {
                    NSLog(@"已经拥有 Moderator 角色了。");
                }
            }];
            
        } else {
            // 角色不存在，就新建角色
            AVRole *moderatorRole =[AVRole roleWithName:@"Moderator"];
            [[moderatorRole users ] addObject:[AVUser currentUser]];// 赋予角色
            [moderatorRole saveInBackground];
        }
    }];
```
{% endblock %}

{% block remove_role_from_user %}

```
    AVQuery *roleQuery= [AVRole query];
    [roleQuery whereKey:@"name" equalTo:@"Moderator"];
    [roleQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
        // 如果角色存在
        if ([objects count] > 0) {
            AVRole *moderatorRole= [objects objectAtIndex:0];
            [roleQuery whereKey:@"users" equalTo:[AVUser currentUser]];
            [roleQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error){
                // 如果用户确实拥有该角色，那么就剥夺
                if ([objects count] > 0) {
                    [[moderatorRole users ]  removeObject:[AVUser currentUser]];
                    [moderatorRole saveInBackground];
                }
            }];
        }
    }];
```
{% endblock %}

{% block asign_role_to_parent %}

```
    AVRole *administratorRole = [AVRole roleWithName:@"Administrator"];
    AVRole *moderator = [AVRole roleWithName:@"Moderator"];
    
    [administratorRole save];
    [administratorRole save];
    
    [[moderator roles] addObject:administratorRole];
    
    [moderator save];
    /**
     * 以上用同步方法是为了保证在调用 [[moderator roles] addObject:administratorRole] 之前 administratorRole 和 moderator 都已保存在服务端，当然开发者也可以调用 saveInBackground ，但是需要按照顺序逐步调用 saveInBackground
     **/
```
{% endblock %}

{% block share_role %}

```
    // 新建 3个角色实例
    AVRole *photographicRole = [AVRole roleWithName:@"Photographic"];
    AVRole *mobileRole = [AVRole roleWithName:@"Mobile"];
    AVRole *digitalRole = [AVRole roleWithName:@"Digital"];
    
    [photographicRole save];
    [mobileRole save];
    
    // photographicRole 和 mobileRole 继承了 digitalRole
    [[digitalRole roles] addObject:photographicRole];
    [[digitalRole roles] addObject:mobileRole];

    [digitalRole save];
 
    AVObject *photographicPost= [AVObject objectWithClassName:@"Post"];
    AVObject *mobilePost = [AVObject objectWithClassName:@"Post"];
    AVObject *digitalPost = [AVObject objectWithClassName:@"Post"];
    //.....此处省略一些具体的值设定
    
    AVACL *photographicACL = [AVACL ACL];
    [photographicACL setReadAccess:YES forRole:photographicRole];
    [photographicACL setWriteAccess:YES forRole:photographicRole];
    [photographicPost setACL:photographicACL];
    
    AVACL *mobileACL = [AVACL ACL];
    [mobileACL setReadAccess:YES forRole:mobileRole];
    [mobileACL setWriteAccess:YES forRole:mobileRole];
    [mobilePost setACL:mobileACL];
    
    AVACL *digitalACL = [AVACL ACL];
    [digitalACL setReadAccess:YES forRole:digitalRole];
    [digitalPost setACL:digitalACL];
    
    // photographicPost 只有 photographicRole 可以读写
    // mobilePost 只有 mobileRole 可以读写
    // 而 photographicRole，mobileRole，digitalRole 均可以对 digitalPost 进行读写
    [photographicPost save];
    [mobilePost save];
    [digitalPost save];
```

{% endblock %}



