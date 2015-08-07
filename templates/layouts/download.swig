<!doctype html>

<html>

<head>

{% include 'templates/include/head.html' %}
</head>

<body  class="dashboard-init" ng-cloak ng-controller="AppCtrl">

{% include 'templates/include/header.html' %}

<div class="container-fluid" id="content" style="padding-bottom: 0;">
  <div class="row">
    <div class="col-sm-12">
      <div class="doc-content">
        {{body}}
      </div>
      <!-- .doc-content -->
    </div>
    <!-- .col-sm-12 -->
  </div>
  <!-- .row -->
</div>
<!-- .container-fluid -->

{% include 'templates/include/footer.html' %}


</body>

</html>