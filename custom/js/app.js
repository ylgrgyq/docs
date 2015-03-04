//apps data
angular.module("app", []);
angular.module("app").controller("AppCtrl", ['$scope', '$http', '$timeout','$compile',
    function($scope, $http, $timeout, $compile) {

        // $timeout(function(){

        //     // $compile(angular.element('body'),$scope);
        //     $scope.$apply(refactDom)
        // },3000);
        pretty();
        refactDom($timeout,$scope,$compile);
        // $(body).html($com)
        $('#content').html($compile($('#content').html())($scope));
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

                }


            }).error(function(data) {

        });


        function refactDom($timeout,$scope,$compile){
            $("pre.prettyprint code").each(function(index, ele) {
              $(ele).after("<div class='doc-example-action'><button class='copybtn'>Copy</button></div>");
              var appsStr = " <div class='doc-example-selector' ng-show='apps.length' ><span>选择应用 <select ng-model='currentApp' ng-options='app.app_name for app in apps'></select></span>";
              $(ele).after(appsStr);
              glueCopy();
            });
            // code pretty
        }

        function pretty(){
            var pres = document.getElementsByTagName("pre");
            for (var i = 0; i < pres.length; i++) {
                pres[i].className = "prettyprint";

            }

            prettyPrint();
        }
        function glueCopy(){
            $(function() {
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
        }
    }
]);