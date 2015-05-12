{% extends "./leanengine_guide.tmpl" %}

{% block createProject %}
首先请安装好 [python](https://www.python.org/) 与 [pip](https://pip.pypa.io/)。

**注意**： 目前 LeanEngine 的 Python 版本为 2.7，请你最好使用此版本的 Python 进行开发。Python 3 的支持正在开发中。

创建一个叫做 `HelloLeanEngine` 的文件夹，作为项目的根目录。

在你的项目根目录创建一个 requirements.txt 的文件，填入以下内容：

```
flask
```

在项目根目录执行 `pip install -r requirements.txt`。这样即可将 flask 安装>至系统。

**注意**： 推荐你使用 [virtualenv](https://virtualenv.pypa.io) 来将当前项>目的第三方依赖与系统全局依赖做隔离，防止不同项目之间依赖的版本冲突。

创建 `app.py`：

```python
# coding: utf-8

from flask import Flask

app = Flask(__name__)


@app.route('/')
def index():
    return 'Hello, World!'


@app.route('/1/ping')
def ping():
    return 'pong'
```

**注意**： `/1/ping` 这个页面的请求是必须的，LeanEngine 会定期去访问你的项目的此地址，检测项目可用性。

创建 `wsgi.py`：

```python
# coding: utf-8

from wsgiref import simple_server

from app import app

application = app


if __name__ == '__main__':
  server = simple_server.make_server('localhost', 8000, application)
  server.serve_forever()
```
{% endblock %}

{% block run_in_local_command %}
```
$ python wsgi.py
```
{% endblock %}

{% block others_web_framework %}
LeanEngine 支持任意 python 的 web 框架，你可以使用你最熟悉的框架进行开发。但是请保证 `wsgi.py` 文件中有一个全局变量 `application`，值为一个 wsgi 函数。
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


APP_ID = os.environ.get('LC_APP_ID', 'your_app_id')
MASTER_KEY = os.environ.get('LC_APP_MASTER_KEY', 'your_master_key')

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

@cloudcode.cloud_func
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
TODO
{% endblock %}

{% block runFuncName %}TODO{% endblock %}

{% block defineFuncName %}`@cloudcode.cloud_func`{% endblock %}

{% block runFuncExample %}
TODO
{% endblock %}

{% block runFuncApiLink %}TODO{% endblock %}

{% block beforeSaveExample %}
```python
@cloudcode.before_save('Review')  # Review 为需要 hook 的 class 的名称
function before_review_save(review):
	comment = review.get('comment')
	if not comment:
		raise cloudcode.CloudCodeError('No comment!')
	if len(comment) > 140:
		review.comment.set('comment', comment[:137] + '...')
```
{% endblock %}

{% block afterSaveExample %}
```python
import leancloud
import cloudcode


@cloudcode.atfer_save('Comment')  # Comment 为需要 hook 的 class 的名称
def after_comment_save(comment):
	post = leancloud.Query('Post').get(comment.id)
	post.increment('commentCount')
	try:
		post.save()
	except leancloud.LeanCloudError:
		raise cloudcode.CloudCodeError('Got an error when save post')
```
{% endblock %}

{% block afterSaveExample2 %}
TODO
{% endblock %}

{% block afterUpdateExample %}
```python
import cloudcode
import leancloud


@cloudcode.after_update('Article')  # Article 为需要 hook 的 class 的名称
def after_article_update(article):
	print 'article with id {} updated!'.format(article.id)
```
{% endblock %}

{% block beforeDeleteExample %}
```python
import cloudcode
import leancloud


@cloudcode.before_delete('Album')  # Article 为需要 hook 的 class 的名称
def before_album_delete(albun):
    query = leancloud.Query('Photo')
    query.equal_to('album', album)
    try:
        matched_count = query.count()
    except leancloud.LeanCloudError:
        raise cloudcode.CloudCodeError('cloud code error')
    if count > 0:
	     raise cloudcode.CloudCodeError('Can\'t delete album if it still has photos.')
```
{% endblock %}

{% block afterDeleteExample %}
```python
import cloudcode
import leancloud


@cloudcode.after_delete('Album')  # Album 为需要 hook 的 class 的名称
def after_album_delete(album):
    query = leancloud.Query('Photo')
    query.equal_to('album', album)
    try:
        query.destroy_all()
    except leancloud.LeanCloudError:
        raise cloudcode.CloudCodeError('cloud code error')
```
{% endblock %}

{% block onVerifiedExample %}
```python
import cloudcode


@cloudcode.on_verified('sms')
def on_sms_verified(user):
	print user
```
{% endblock %}

{% block onLoginExample %}
TODO
{% endblock %}

{% block errorCodeExample %}
TODO
{% endblock %}

{% block errorCodeExample2 %}
TODO
{% endblock %}

{% block timerExample %}
TODO
{% endblock %}

{% block timerExample2 %}
TODO
{% endblock %}

{% block masterKeyInit %}
TODO
{% endblock %}

{% block loggerExample %}
TODO
{% endblock %}
