//apps data
angular.module("app", []);
angular.module("app").controller("AppCtrl", ['$scope', '$http', '$timeout','$compile',
    function($scope, $http, $timeout, $compile) {

        $scope.appid = "{{appid}}";
        $scope.appkey = "{{appkey}}";

        $http.get('/1/clients/self').success(function(data){
            $scope.user=data;
        });

        $http.get("/1/clients/self/apps").success(
            function(data) {
                if (data.length > 0) {

                    $scope.currentApp = data[0];
                    $scope.$watch('currentApp', function() {
                        if($scope.currentApp&&$scope.currentApp.app_id){
                            $scope.appid = $scope.currentApp.app_id;
                            $scope.appkey = $scope.currentApp.app_key;
                        }

                    });
                    $scope.apps = data;

                }

            }).error(function(data) {

            });
        }
    ]);

$(function(){
    angular.element(document).ready(function() {
      angular.bootstrap(document, ['app']);
      var sdkversion = 'unknown';
      if(typeof $sdk_versions != 'undefined'){
        sdkversion = $sdk_versions;
      }
      angular.element("body").scope().sdkversion = sdkversion;
    });
});
