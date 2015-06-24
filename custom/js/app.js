//apps data
var purl = '/1/';
angular.module("app", ['ui.gravatar']);
angular.module("app").controller("AppCtrl", ['$scope', '$http', '$timeout','$compile','$rootScope',

    function($scope, $http, $timeout, $compile,$rootScope) {

        console.log()
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
        $scope.commentHost = commentHost;
        var docVersion = $('html').first().attr('version');
        $scope.showCommentDialog = function(e,snippetVersion){
            $scope.snippetVersion = snippetVersion;
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
                var all = {};
                angular.forEach(result,function(v,k){
                    // $('[version="'+v.snippetVersion+'"]').append(v.count);
                    all[v.snippetVersion] = v.count;
                });
                $scope.allComment = all;
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
            snippet = snippet || $scope.snippetVersion;
            $http.get(commentHost+'/docs/'+docVersion+'/snippets/'+snippet+'/comments',{
                withCredentials:true
            }).success(function(result){
                $scope.currentComments = result;
            });
        }

        $scope.createComment = function(e){
            if(!$scope.commentContent){
                return;
            }
            $http({
                method: 'post',
                url:commentHost+'/docs/'+docVersion+'/snippets/'+$scope.snippetVersion+'/comments',
                withCredentials: true,
                headers:{
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                transformRequest: function(obj) {
                        var str = [];
                        for(var p in obj)
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        return str.join("&");
                },
                data:{
                    content: $scope.commentContent
                }

            })
            .success(function(result){
                $scope.commentContent = '';
                var snippet = $scope.snippetVersion;
                if($scope.allComment[snippet]){
                    $scope.allComment[snippet]+=1;
                }else{
                    $scope.allComment[snippet]=1;
                }
                $scope.getCommentsBySnipeet();
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

angular.module('app').directive('lcComment',['$compile',function($compile){
    return {
        restrict: 'AE',
        scope:{
            version:'@version',
            allComment: '=allComment'
        },
        template:'<div class="toggle-comment" ng-click="f($event)">+ <span>  {{allComment[version]}} </span> </div>',
        link: function(scope, element, attrs) {
            scope.f = function(e){
                scope.$parent.showCommentDialog(e,scope.version);
            }
            // console.log(1,element.contents())
            // $compile(element.contents())(scope.$new());
        }
    }
}]);

// angular.module('app').directive('pre', function() {
//     return {
//         restrict: 'E',
//         link: function postLink(scope, element, attrs) {
//               element.html(prettyPrintOne(element.html()));
//         }
//     };
// });



$(function(){
    // $('#content [version]').each(function(k,v){
    //     var version = $(v).attr('version');
    //     $(v).append('<div class="toggle-comment" ng-click="showCommentDialog(\''+version+'\''+',$event)">+ <span> {{}}</span> </div>');
    // })
    $('#content [version]').each(function(k,v){
        var version = $(v).attr('version');
        $(v).append('<div version="'+version+'" all-comment="allComment" showDialogMethod="showCommentDialog()" lc-comment> </div>');
    })
    // .append('<div class="toggle-comment" ng-click="showCommentDialog()">++</div>');
    angular.element(document).ready(function() {

      angular.bootstrap(document, ['app']);

    });
});

