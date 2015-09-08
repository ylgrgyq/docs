{% extends "./leanengine_guide.tmpl" %}

{% block quick_start_create_project %}
从 Github 迁出实例项目，该项目可以作为一个你应用的基础：

```
$ git clone git@github.com:leancloud/python-getting-started.git
$ cd python-getting-started
```

然后添加应用 appId 等信息到该项目：

```
$ avoscloud add <appName> <appId>
```
{% endblock %}

{% block runtime_env %}**注意**： 目前 LeanEngine 的 Python 版本为 2.7，请你最好使用此版本的 Python 进行开发。Python 3 的支持正在开发中。{% endblock %}

{% block demo %}
* [python-getting-started](https://github.com/leancloud/python-getting-started)：这是一个非常简单的 Python Web 的项目，可以作为大家的项目模板。效果体验：http://python.avosapps.com/
{% endblock %}

{% block run_in_local_command %}
安装依赖：

```
$ pip install -Ur requirements.txt
```

启动应用：

```
$ python wsgi.py
```
{% endblock %}

{% block cloud_func_file %}`$PROJECT_DIR/cloud.py`{% endblock %}

{% block ping %}
LeanEngine 中间件内置了该 URL 的处理，只需要将中间件添加到请求的处理链路中即可：

```python
from leancloud import Engine
engine = Engine(your_wsgi_app)
```

如果未使用 LeanEngine 中间件，可以自己实现该 URL 的处理，比如这样：

```python
@app.route('/__engine/1/ping')
def ping():
    version = sys.version_info
    return flask.jsonify({
        'runtime': 'cpython-{0}.{1}.{2}'.format(version.major, version.minor, version.micro),
        'version': 'custon',
    })
```

{% endblock %}

{% block others_web_framework %}
LeanEngine 支持任意 python 的 web 框架，你可以使用你最熟悉的框架进行开发。但是请保证 `wsgi.py` 文件中有一个全局变量 `application`，值为一个 wsgi 函数。
{% endblock %}

{% block project_constraint %}
LeanEngine Python 项目必须有 `$PROJECT_DIR/wsgi.py` 与 `$PROJECT_DIR/requirements.txt` 文件，该文件为整个项目的启动文件。
{% endblock %}

{% block install_middleware %}
首先需要安装 LeanCloud Python SDK，在你的项目 `requirements.txt` 中增加一行新的依赖：

```
leancloud-sdk
```

之后执行 `pip install -r requirements.txt`来安装 LeanCloud Python SDK。
{% endblock %}

{% block init_middleware %}
```python
import os

import leancloud
from flask import Flask


APP_ID = os.environ.get('LC_APP_ID', '{{appid}}') # your app id
MASTER_KEY = os.environ.get('LC_APP_MASTER_KEY', '{{masterkey}}') # your app master key

leancloud.init(APP_ID, master_key=MASTER_KEY)

app = Flask(__name__)
engine = leancloud.Engine(app)
```

之后请在 wsgi.py 中将 engine 赋值给 application（而不是之前的 Flask 实例）。
{% endblock %}

{% block sdk_guide_link %}[Python SDK](./python_guide.html){% endblock %}

{% block cloudFuncExample %}
```python
from leancloud import Query
from leancloud import Engine

@engine.define
def averageStars(movie):
    sum = 0
    query = Query('Review')
    try:
        reviews = query.find()
    except leancloud.LeanCloudError, e:
        // 如果不想做特殊处理，可以不捕获这个异常，直接抛出
        print e
        raise e
    for review in reviews:
        sum += review.get('starts')
	return sum / len(reviews)
```
{% endblock %}

{% block cloudFuncParams %}
客户端传递的参数，会被当作关键字参数传递进云函数。

比如上面的例子，调用时传递的参数为 `{"movie": "The Matrix"}`，定义云函数的时候，参数写movie，即可拿到对应的参数。

但是有时候，您传递的参数可能是变长的，或者客户端传递的参数数量错误，这时候就会报错。为了应对这种情况，推荐您使用关键字参数的形式来获取参数：

如果是已登录的用户发起云代码调用，可以通过 `engine.current_user` 拿到此用户。如果通过 REST API 调用时模拟用户登录，需要增加一个头信息 `X-AVOSCloud-Session-Token: <sessionToken>`，该 `sessionToken` 在用户登录或注册时服务端会返回。

```python
@engine.define
def some_func(**params):
    # do something with params
    pass
```

这样 `params` 就是个 `dict` 类型的对象，可以方便的从中拿到参数了。

{% endblock %}

{% block runFuncName %}
runFuncName


{% endblock %}

{% block defineFuncName %}`engine.define`{% endblock %}

{% block runFuncExample %}
```python
from leancloud import cloudfunc

try:
    result = cloudfunc.run('hello', name='dennis')
    # 调用成功，拿到结果
except LeanCloudError, e:
    print e
    # 调用失败
```
{% endblock %}

{% block runFuncApiLink %}[cloudfunc.run](./api/python/leancloud.engine.html#/module-leancloud.engine.cloudfunc){% endblock %}

{% block beforeSaveExample %}
```python
@engine.before_save('Review')  # Review 为需要 hook 的 class 的名称
function before_review_save(review):
	comment = review.get('comment')
	if not comment:
		raise leancloud.LeanEngineError(message='No comment!')
	if len(comment) > 140:
		review.comment.set('comment', comment[:137] + '...')
```
{% endblock %}

{% block afterSaveExample %}
```python
import leancloud


@engine.after_save('Comment')  # Comment 为需要 hook 的 class 的名称
def after_comment_save(comment):
	post = leancloud.Query('Post').get(comment.id)
	post.increment('commentCount')
	try:
		post.save()
	except leancloud.LeanCloudError:
		raise leancloud.LeanEngineError(message='An error occurred while trying to save the Post. ')
```
{% endblock %}

{% block afterSaveExample2 %}
```python
@engine.after_save('_User')
def after_user_save(user):
  print user
  user.set('from', 'LeanCloud')
  try:
    user.save()
  except LeanCloudError, e:
    print 'error:', e
```
{% endblock %}

{% block afterUpdateExample %}
```python
import leancloud


@engine.after_update('Article')  # Article 为需要 hook 的 class 的名称
def after_article_update(article):
	print 'article with id {} updated!'.format(article.id)
```
{% endblock %}

{% block beforeDeleteExample %}
```python
import leancloud


@engine.before_delete('Album')  # Article 为需要 hook 的 class 的名称
def before_album_delete(albun):
    query = leancloud.Query('Photo')
    query.equal_to('album', album)
    try:
        matched_count = query.count()
    except leancloud.LeanCloudError:
        raise engine.LeanEngineError(message='cloud code error')
    if count > 0:
	     raise engine.LeanEngineError(message='Can\'t delete album if it still has photos.')
```
{% endblock %}

{% block afterDeleteExample %}
```python
import leancloud


@engine.after_delete('Album')  # Album 为需要 hook 的 class 的名称
def after_album_delete(album):
    query = leancloud.Query('Photo')
    query.equal_to('album', album)
    try:
        query.destroy_all()
    except leancloud.LeanCloudError:
        raise leancloud.LeanEngineError(message='cloud code error')
```
{% endblock %}

{% block onVerifiedExample %}
```python
@engine.on_verified('sms')
def on_sms_verified(user):
	print user
```
{% endblock %}

{% block onLoginExample %}
```python
@engine.on_login
def on_login(user):
    print 'on login:', user
    if user.get('username') == 'noLogin':
      # 如果抛出 LeanEngineError，则用户无法登录（收到 401 响应）
      raise LeanEngineError('Forbidden')
    # 没有抛出异常，函数正常执行完毕的话，用户可以登录
```
{% endblock %}

{% block errorCodeExample %}

有些时候你希望能自己定义错误响应码。如果您的云代码抛出了 `LeanCloudError`（数据存储 API 会抛出此异常），会直接返回以 `LeanCloudError` 的错误码和原因返回给客户端。若想自定义错误码，可以自行构造 `LeanEngineError`，将 `code` 与 `error` 传入。否则 `code` 为 `1`， `message` 为错误对象的字符串形式。比如下列代码：

```python
@engine.define
def error_code(**params):
    leancloud.User.login('not_this_user', 'xxxxxxx')
```
{% endblock %}

{% block errorCodeExample2 %}
```python
from leancloud import LeanEngineError

@engine.define
def custom_error_code(**params):
    raise LeanEngineError(123, 'custom error message')
```
{% endblock %}

{% block http_client %}
LeanEngine 可以使用 Python 内置的 urllib，不过推荐您使用 [requests](http://docs.python-requests.org/) 等第三方模块来处理 HTTP 请求。
{% endblock %}

{% block timerExample %}
```python
@engine.define
def log_timer():
    print 'Log in timer.'
```
{% endblock %}

{% block timerExample2 %}
```python
from leancloud import push

@engine.define
def push_timer():
    data = {
        'alert': 'Public message',
    }
    push.send(data, channels=['Public'])
```
{% endblock %}

{% block masterKeyInit %}
```python
leancloud.init('{{appid}}', master_key='{{masterkey}}')
```
{% endblock %}

{% block loggerExample %}
```python
@engine.define
def log_something(**params):
    print params
```
{% endblock %}

{% block use_framework %}

LeanEngine 环境中可以使用大部分 Python Web Framework，比如 [Flask](http://flask.pocoo.org/)、[web.py](http://webpy.org/)、[bottle](http://bottlepy.org/)。

事实上，您只需要提供一个兼容 WSGI 标准的框架，并且安装了 LeanEngine 的中间件，就可以在 LeanEngine 上运行。您提供的 WSGI 函数对象需要放在 `$PROJECT_DIR/wsgi.py` 文件中，并且变量名需要为 `application`。

```python
from leancloud import Engine


def wsgi_func(environ, start_response):
    // 定义一个简单的 WSGI 函数，或者您可以直接使用框架提供的
    start_response('200 OK', [('Content-Type', 'text/plain')])
    return ['Hello LeanCloud']


application = Engine(wsgi_func)
```

将这段代码放到 `wsgi.py` 中，就可以实现一个最简单的动态路由。

{% endblock %}

{% block upload_file %}{% endblock %}

{% block cookie_session %}
{% endblock %}

{% block custom_session %}
{% endblock %}

{% block cookie_session_middleware %}TODO{% endblock %}

{% block https_redirect %}

```python
from leancloud import HttpsRedirectMiddleware

# app 为您的 wsgi 函数
app = HttpsRedirectMiddleware(app)
engine = Engine(app)
application = engine
```

{% endblock %}

{% block get_env %}
```python
import os

if os.environ.get('LC_APP_PROD') == '1':
    # 当前为生产环境
elif os.environ.get('LC_APP_PROD') == '0':
    # 当前为测试环境
else:
    # 当前为开发环境
```
{% endblock %}
