// size format
(function() {
    var prettyBytes = function(num) {
        if (typeof num !== 'number') {
            throw new TypeError('Input must be a number');
        }

        var exponent;
        var unit;
        var neg = num < 0;

        if (neg) {
            num = -num;
        }

        if (num === 0) {
            return '0 B';
        }

        exponent = Math.floor(Math.log(num) / Math.log(1000));
        num = (num / Math.pow(1000, exponent)).toFixed(2) * 1;
        unit = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'][exponent];

        return (neg ? '-' : '') + num + ' ' + unit;
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = prettyBytes;
    } else {
        window.prettyBytes = prettyBytes;
    }
})();

// code pretty
$(function() {
  var pres = document.getElementsByTagName("pre");
  for (var i = 0; i < pres.length; i++) {
      pres[i].className = "prettyprint";

  }

  prettyPrint();

  $("pre.prettyprint code").each(function(index, ele) {
    $(this).after("<div class='doc-example-action'><button class='copybtn'>Copy</button></div>");

  });
  var clip = new ZeroClipboard();
  clip.glue($(".copybtn"));
  clip.on("mousedown", function(client, args) {
    $(this).parents("pre.prettyprint").removeClass("active")
    clip.setText($(this).parents("pre").find("code").text());
  });
  clip.on("complete", function() {
    $(this).parents("pre.prettyprint").addClass("active");
  });
  clip.on('noflash', function() {
    $(".copybtn").hide();
  });
});

// doc search
$(function() {
    $(".search-form input").keyup(function(event) {
        if ($(event).keyCode == 13) {
            $(this).parents("form.search-form").submit()
        }
    });
});

//apps data
angular.module("app", []);
angular.module("app").controller("AppCtrl", ['$scope', '$http', '$timeout',
    function($scope, $http, $timeout) {

        $scope.appid = "{{your_app_id}}";
        $scope.appkey = "{{your_app_key}}";
        $http.get("/1/clients/self/apps").success(
            function(data) {
                if (data.length > 0) {

                    $scope.currentApp = data[0];
                    $scope.$watch('currentApp', function() {
                        $scope.appid = $scope.currentApp.app_id;
                        $scope.appkey = $scope.currentApp.app_key;
                    });
                    $scope.apps = data;
                    $("pre.prettyprint code").each(function(index, ele) {
                      // $(ele).after("<div class='doc-example-action'><button class='copybtn'>Copy</button></div>");
                      if ($scope.apps && $scope.apps.length>0) {
                        // After debuging, re-apply ng-show='currentApp' for .doc-example-selector
                        $timeout(function(){
                          $(ele).after("<div class='doc-example-selector' ng-show='currentApp'><span>选择应用 <select ng-model='currentApp' ng-options='app.app_name for app in apps'></select></span>");
                        });

                      }
                    });
                }

            }).error(function(data) {

        });
    }
]);

// sdk version
$(function(){
  var sdkversion = 'unknown';
  if(typeof $sdk_versions != 'undefined'){
    sdkversion = $sdk_versions;
  }
  angular.element("body").scope().sdkversion = sdkversion;
})
