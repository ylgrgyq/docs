## 注册 App ID

首先，按照以下步骤注册 App ID：

如果您已经注册过带有推送通知 App ID，可以跳过该步骤。

1. 前往[苹果开发者中心](https://developer.apple.com/account/)进行登录。
2. 点击 Certificates, Identifiers & Profiles。
3. 选择 Identifiers 下的 App IDs。
4. 点击右上方的加号按钮 (+)。
5. 填写 App ID 的基本信息。

 ![Create App ID](images/ios_cert_v2/create_app_id.png)

6. 选择创建 Explicit App ID，填入 app 的 bundle ID。注意，Explicit App ID 不能包含星号 (*)。

 ![Enter Explicit bundle ID](images/ios_cert_v2/enter_explicit_app_id.png)

7. 选择 App ID 需要开启的服务。此处要勾选 Push Notifications。

 ![Select push notification](images/ios_cert_v2/select_push_notification.png)

8. 点击 Continue。
9. 确认注册信息，然后点击 Register。
10. 点击 Done。

## 为已有的 App ID 开启推送通知

如果您希望为已有的 App ID 开启推送通知，可以通过以下步骤来完成：

1. 选择要开启推送通知的 App ID。
2. 勾选 Push Notifications 复选框。

 ![Edit push notification](images/ios_cert_v2/edit_push_notification.png)

3. 如果弹出警告对话框，点击 OK。
4. 点击 Done。

## 创建推送证书

每个 App ID 都需要单独的客户端 SSL 证书来和 APNs 通信。从2015年12月17日起，APNs服务全面支持HTTP/2协议，推送证书也进行了相应的调整。推出了 Universal Push Notification Client SSL 证书（下文简称：Universal 推送证书）。通过下图中红框标注的 “Apple Push Notification service SSL (Sandbox & Production)”这种方式创建的推送证书就是 Universal 推送证书

   ![what is Universal Push Notification Client SSL Certificate](images/ios_cert_v2/what_is_universal_push_notification_client_ssl_certificate)
  
  图中其他方式，就叫做非 Universal 方式（下文简称：非 Universal 推送证书）：
  
  ![what is not Universal Push Notification Client SSL Certificate](images/ios_cert_v2/what_is_not_universal_push_notification_client_ssl_certificate)

这里也推荐使用 Universal 推送证书来进行推送服务。

注意：使用 Universal 推送证书，iOS-SDK需要使用 v3.2.8 以上的版本，以获得更快速的推送效果。下面介绍下创建 Universal 推送证书的步骤（非 Universal 推送证书申请步骤也是类似的）：

 1. 前往苹果开发者中心 https://developer.apple.com 点击 “Certificates, Identifiers & Profiles”。
 ![enter Certificates, Identifiers & Profiles](images/ios_cert_v2/enter_certificates_identifiers_profiles)
 2. 选择在 Certificates 栏下的“All”。
 3. 点击下图中红色边框内的加号按钮。
  ![Create SSL certificate](images/ios_cert_v2/create_ssl_certificate)
 4. 选择 “Production” 栏下的 “Apple Push Notification service SSL (Sandbox & Production)” 勾选后，点击下一步。
    ![Select push certificate](images/ios_cert_v2/what_is_universal_push_notification_client_ssl_certificate)
 5. 从 App ID 下拉菜单中选择你需要的 App ID ，点击下一步。
 ![select App ID](images/ios_cert_v2/select_app_id.png)
 6. 这时会出现 **About Creating a Certificate Signing Request (CSR)**。
  ![guide to create a CSR](images/ios_cert_v2/guide_to_create_a_csr.png)

  根据它的说明创建 Certificate Signing Request。
  ![how to create a CSR](images/ios_cert_v2/how_to_create_a_csr.png)
 7. 点击下图中的 “Choose File” 按钮：
  ![upload CSR File](images/ios_cert_v2/upload_csr_file.png)
 8. 上传刚刚生成的 .certSigningRequest 文件 生成 APNs Push Certificate。
 9. 下载证书。
 10. 双击打开证书，证书打开时会启动 钥匙串访问工具。
  在 钥匙串访问 中你的证书会显示在 “证书” 中，注意选择左下角的 “证书” 和左上角 “登录”。

   ![confirm create cer success](images/ios_cert_v2/confirm_create_cer_success.png)


## 验证 App ID 的推送服务是否打开

1. 点击 Identifiers 下的 App IDs。
2. 选择与应用 bundle ID 匹配的 App ID。
3. 如果下图中红色方框中显示 Enabled，表示 App ID 的推送证书已配置好。

 ![Verify push notification](images/ios_cert_v2/verify_push_notification.png)

## 导出证书

1. 打开 Keychain Access，找到要导出的证书。证书名有前缀 Apple Push Services。
2. 右键点击证书，选择导出（Export）。选择保存格式为 .p12。此时会提示您输入密码来保护导出的证书，**此时请不要输入密码**，让两个输入框为空，点击 OK。接着又会弹出一个对话框，要求您输入 OS X 账户的密码来允许从 Keychain Access 中导出，请填写密码并点击允许（Allow）。

## 上传证书

1. 进入 [LeanCloud 应用控制台 > 消息 > 推送 > 设置](/messaging.html?appid={{appid}}#/message/push/conf)，然后就可以看到下面的页面：
  ![Push certificate configure](images/ios_cert_v2/push_certificate_config.png)

2. 根据您的证书类别进行上传。这里请注意区分证书的类别，测试环境证书和生产环境证书请勿混淆。

 Universal 推送证书需要上传到图中的“自定义证书”中，

 这里注意：在 LeanCloud 的推送服务中，出于兼容性考虑，这里的 Universal 证书只能用于生产环境，如果需要进行推送测试，请使用图中的“测试环境证书”。

 在 LeanCloud 的推送服务中，不同类型的推送证书能够服务的环境略有不同，对应关系如下图所示：

 ![relation between cer and prod or dev](images/ios_cert_v2/relation_between_cer_and_prod_or_dev)