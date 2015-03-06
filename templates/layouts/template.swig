<!doctype html>

<html>

<head>
    {% include 'templates/include/head.html' %}

</head>


<body  class="dashboard-init" data-spy="scroll" data-target=".sidebar-wrapper" data-offset="30" ng-cloak>

{% include 'templates/include/header.html' %}

<div class="container-fluid">

  <div class="row">

    <div class="col-sm-3 sidebar-gruntfile-trigger" id="left-nav">

      <div class="sidebar-affix-shadow sidebar-hover-off">

        <div class="sidebar-wrapper" id="toc-wrapper">

        </div>
        <!-- .sidebar-wrapper -->

      </div>
      <!-- .sidebar-affix-shadow -->

    </div>
    <!-- .col-md-3 -->

    <div class="col-sm-9 sidebar-gruntfile-trigger">
      <div class="doc-content" ng-controller="AppCtrl" id="content">
        {{body}}
      </div>
    </div>
    <!-- .col-md-9 -->
  </div>
  <!-- .row -->

</div>
<!-- .container-fluid -->

{% include 'templates/include/footer.html' %}

</body>

</html>
