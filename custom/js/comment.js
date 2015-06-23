

angular.module("app").controller("CommentCtrl", ['$scope', '$http', '$timeout','$compile','$rootScope',function(){

});

$.ajaxSetup({
    crossDomain: true,
    xhrFields: {
        withCredentials: true
    }
});
$(function(){
	var commentHost = 'https://comment.avosapps.com';
	var currentUser;
	var docVersion = $('html').first().attr('version');
	var snippetVersion;



	function getComments(){
		$.get(commentHost+'/docs/'+docVersion+'/commentCount').then(function(result){
			console.log(result);
			result.forEach(function(v,k){
				console.log('[version="'+v.snippetVersion+'"]');
				if($('[version="'+v.snippetVersion+'"]').prop('tagName')!='HTML'){
					$('[version="'+v.snippetVersion+'"]').after(v.count)
				}

				console.log($([version=v.snippetVersion]))
			})
		});
	}
	function getCommentsBySnipeet(snippet){
		$.get(commentHost+'/docs/'+docVersion+'/snippets/'+snippet+'/comments').then(function(result){
			console.log(result);
			var str = [];
			str.push('<ul>');
			result.forEach(function(v,k){
				str.push('<li>'+v.content+' - '+v.author+' '+v.updatedAt+'</li>')
			});
			str.push('</ul>');
			$('.comment-list').html(str.join(''));
		});
	}

	function createComment(e){
		var commentContent = $(e.target).parents('.comment-container').find('.comment-content').val();
		$.post(commentHost+'/docs/'+docVersion+'/snippets/'+snippetVersion+'/comments',{
			content: 'test'
		}).then(function(result){
			console.log(result)
		},function(err){
			if(err.status == 401){
				// window.open(commentHost+'/users/login')
				location.href = commentHost+'/users/login';
			}
			console.log('error',err)
		})
	}

	function getUser(){
		$.get(commentHost+'/users/current').then(function(result){
			currentUser = result;
			$('.comment-create').html(getCommentCreateArea());
		});
	}
	getUser();

	function initCommentDialog(){
		$('#content [version]').append('<div class="toggle-comment">+</div>');
		// if($('#comment-container').length<1){
		// 	$(document.body).append('<div id="comment-container" style="">'
		// 		+ '<div class="hd"><span class="close" >X</span></div>'
		// 		+ '<div class="comment-create">' + getCommentCreateArea() +'</div>'
		// 		+ '<div class="bd"> <div class="comment-list"></div> </div>'
		// 		+'</div>');
		// }
	}


	function getCommentCreateArea(){
		// str.push('<div class="pull-right clearfix">{{title}}</div>');
		var userStr;
		if(currentUser){
			var commentCreateHtml = '<div>'
			commentCreateHtml += '<div class="form-group"> <textarea class="form-control comment-content"></textarea></div>';
			commentCreateHtml += '<div>'+currentUser.username+'<button class="btn btn-sm btn-default create-comment"> 评论</button>'+'</div>';
			commentCreateHtml += '</div>'
			userStr = commentCreateHtml;
		}else{
			userStr = '<div><button class="btn btn-sm btn-default" href="'+commentHost+"/users/login"+'" target="_self"> 登录</button></div>';
		}
		return userStr;
	}
	function showCommentDialog(e){
		snippetVersion = $(e.target).parents('[version]').attr('version');
		getCommentsBySnipeet(snippetVersion);
		var	mouseX = e.pageX;
		var mouseY = e.pageY;
		var xoffset = 20;
		var yoffset = 20;

		$('#comment-container').show();
		$('#comment-container').css({
			left:mouseX+xoffset,
			top: mouseY+yoffset
		});
	}
	initCommentDialog();
	getComments();
	$(document).on('click','.create-comment',createComment);
	$(document).on('click','.toggle-comment',function(e){
    showCommentDialog(e)
	});
	$(document).on('click','#comment-container .close',function(e){
    $('#comment-container').hide()
	});


});


