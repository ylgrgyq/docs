<!doctype html>

<html>

<head>

{% include 'templates/include/head.html' %}
</head>

<body ng-app="app" class="dashboard-init" ng-cloak>

{% include 'templates/include/header.html' %}

<div id="content" class="container-fluid" style="padding-bottom: 0;">
{{body}}
</div>
<!-- .container-fluid -->

{% include 'templates/include/footer.html' %}
    {% if basename=='sdk_down' %}
    <script type="text/javascript" src="download.js">
    </script>
    {% endif %}

<script src="markdown.js"></script>
{% if basename=='demo' %}
<script src="demo.js">

</script>
{% endif %}

</body>

</html>