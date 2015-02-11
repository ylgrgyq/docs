angular.module("app",[]);
angular.module("app").controller("AppCtrl",['$scope','$http',function($scope,$http){
	$http.get(  "/1/clients/self/apps").success(

      function(data) {
       console.log(data)
      }).error(function(data) {

      });
}]);