//apps data
var purl = '/1/';
angular.module("app", ['ui.gravatar']);
angular.module("app").controller("AppCtrl", ['$scope', '$http', '$timeout','$compile','$rootScope',

    function($scope, $http, $timeout, $compile,$rootScope) {


        $scope.appid = "{{appid}}";
        $scope.appkey = "{{appkey}}";
        $rootScope.pageState = {};
        var sdkversion = 'unknown';
        if(typeof $sdk_versions != 'undefined'){
          sdkversion = $sdk_versions;
        }
        angular.element("body").scope().sdkversion = sdkversion;

        $http.get('/1/clients/self').success(function(data){
            $scope.user=data;
        });

        $http.get("/1/clients/self/apps").success(
            function(data) {
                if (data.length > 0) {


                    $rootScope.pageState.currentApp = data[0];

                    $scope.$watch('pageState.currentApp', function() {
                        if($scope.pageState.currentApp&&$scope.pageState.currentApp.app_id){
                            $scope.appid = $scope.pageState.currentApp.app_id;
                            $scope.appkey = $scope.pageState.currentApp.app_key;
                        }

                    });
                    $scope.apps = data;

                }

            }).error(function(data) {

            });
        $scope.signout = function(){
            $http.post('/1/signout').success(function(data) {
                location.reload();
            });
        }

        var commentHost = 'https://comment.avosapps.com';
        var docVersion = $('html').first().attr('version');
        $scope.showCommentDialog = function(snippetVersion,e){
            console.log(e)
            getCommentsBySnipeet(snippetVersion);
            var mouseX = e.pageX;
            var mouseY = e.pageY;
            var xoffset = 20;
            var yoffset = 20;

            $('#comment-container').show();
            $('#comment-container').css({
                left:mouseX+xoffset,
                top: mouseY+yoffset
            });
        }
        function getComments(){
            $http.get(commentHost+'/docs/'+docVersion+'/commentCount',{
                withCredentials: true
            }).success(function(result){
                $scope.allComoments = result;
                angular.forEach(function(v,k){
                    console.log(v);
                })
            });
        }
        $scope.getCommentUser = getUser;
        function getUser(){
            $http.get(commentHost+'/users/current',{
                withCredentials: true
            }).success(function(result){
                $scope.currentCommentUser = result;
            });
        }
        function getCommentsBySnipeet(snippet){
            $scope.snippetVersion = snippet;
            $http.get(commentHost+'/docs/'+docVersion+'/snippets/'+snippet+'/comments',{
                withCredentials:true
            }).success(function(result){
                console.log(result);
                $scope.currentComments = result;
            });
        }

        $scope.createComment = function(e){

            $http({
                method: 'post',
                url:commentHost+'/docs/'+docVersion+'/snippets/'+$scope.snippetVersion+'/comments',
                withCredentials: true,
                headers:{
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data:{
                    content: 'test1s'
                }

            })
            .success(function(result){
                console.log(result)
            }).error(function(err){
                if(err.status == 401){
                    // window.open(commentHost+'/users/login')
                    location.href = commentHost+'/users/login';
                }
                console.log('error',err)
            });
        }
        $scope.getCommentsBySnipeet = getCommentsBySnipeet;

        $scope.closeCommentModal = function(){
            $('#comment-container').hide();
        }
        getComments();
        getUser();
    }]);

angular.module('ui.gravatar').config([
    'gravatarServiceProvider', function(gravatarServiceProvider) {
        gravatarServiceProvider.defaults = {
            size         : 100,
            "default": 'https://leancloud.cn/images/static/default-avatar.png' // Mystery man as default for missing avatars
        };

        // Use https endpoint
        gravatarServiceProvider.secure = true;
    }
]);

angular.module('app').controller('StartCtrl', [
    '$http',
    '$scope',
    '$timeout',
    '$compile',
    function ($http, $scope, $timeout, $compile) {
        $scope.links = {
            'android': {
                doc: '/docs/android_guide.html',
                demo: '/docs/sdk_down.html'
            },
            'ios': {
                doc: '/docs/ios_os_x_guide.html',
                demo: '/docs/sdk_down.html'
            },
            'js': {
                doc: '/docs/js_guide.html',
                demo: '/docs/sdk_down.html'
            },
            'unity': {
                doc: '/docs/unity_guide.html',
                demo: '/docs/sdk_down.html'
            },
            'wp': {
                doc: '/docs/dotnet_guide.html',
                demo: '/docs/sdk_down.html'
            }
        };

        $scope.selectedPlat = 'ios';


        $scope.createApp = function () {
            $http.post(purl + 'clients/self/apps', { name: $scope.appname }).success(function (data) {
                $scope.SelectedApp = data;
            }).error(function (data) {
            });
        };



        $scope.$watch('selectedPlat',function(){
            $http.get('start/'+$scope.selectedPlat+'_start.html').
                success(function(result){
                    $('#start-main').html(result);
                    prettyPrepare();
                    prettyPrint();
                    $("pre.prettyprint code").each(function(index, ele) {
                      $(ele).after("<div class='doc-example-action'><button class='copybtn'><span class='icon icon-clipboard'></span></button></div>");
                    });
                    glueCopy();
                    $timeout(function(){
                        $compile($('#start-main').contents())($scope);
                    },0);
                    // console.log(result)
                });
        });



    }
]);

// angular.module('app').directive('pre', function() {
//     return {
//         restrict: 'E',
//         link: function postLink(scope, element, attrs) {
//               element.html(prettyPrintOne(element.html()));
//         }
//     };
// });



$(function(){
    $('#content [version]').each(function(k,v){
        $(v).append('<div class="toggle-comment" ng-click="showCommentDialog(\''+$(v).attr('version')+'\''+',$event)">++</div>')
    })
    // .append('<div class="toggle-comment" ng-click="showCommentDialog()">++</div>');
    angular.element(document).ready(function() {
      angular.bootstrap(document, ['app']);

    });
});

