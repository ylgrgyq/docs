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
{% block code_quick_save_a_todo %}{% endblock %}

{% block code_quick_save_a_todo_with_location %}{% endblock %}

{% block text_sdk_setup_link %}{% endblock %}

{% block code_save_todo_folder %}{% endblock %}

{% block code_get_todo_by_objectId %}{% endblock %}

{% block code_save_callback_get_objectId %}{% endblock %}

{% block code_access_todo_folder_properties %}{% endblock %}

{% block code_update_todo_location %}{% endblock %}

{% block code_fetch_todo_when_save %}{% endblock %}

{% block code_atomic_operation_increment %}{% endblock %}

{% block text_atomic_operation_array %}{% endblock %}

{% block code_delete_todo_folder_by_objectId %}{% endblock %}

{% block code_relation_todoFolder_one_to_many_todo %}{% endblock %}

{% block code_pointer_user_one_to_many_todoFolder %}{% endblock %}

{% block table_data_type %}{% endblock %}

{% block code_serialize_baseObject_to_string %}{% endblock %}

{% block code_deserialize_string_to_baseObject %}{% endblock %}
{% block link_to_in_app_search_doc %}[iOS / OS X 应用内搜索指南](in_app_search_guide-ios.html){% endblock %}
{% block link_to_acl_doc %}[iOS / OS X 权限管理使用指南](acl_guide-ios.html){% endblock %}

{# --End--主模板留空的代码段落，子模板根据自身实际功能给予实现 #}

