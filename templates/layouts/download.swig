<!doctype html>

<html>

<head>

{% include 'templates/include/head.html' %}
</head>

<body  class="dashboard-init" ng-cloak>

{% include 'templates/include/header.html' %}

<div id="content" class="container-fluid" style="padding-bottom: 0;">
{{body}}
</div>
<!-- .container-fluid -->

{% include 'templates/include/footer.html' %}





</body>

</html>