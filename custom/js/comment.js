
$.ajaxSetup({
    crossDomain: true,
    xhrFields: {
        withCredentials: true
    }
});
$(function(){
	var commentHost = 'https://comment.avosapps.com';
	AV.initialize("749rqx18p5866h0ajv0etnq4kbadodokp9t0apusq98oedbb", "axxq0621v6pxkya9qm74lspo00ef2gq204m5egn7askjcbib");
	var currentUser;
	var Comment = AV.Object.extend('Comment');
	var docVersion = $('html').first().attr('version');
	var queryComments = function(docVersion, snippetVersion) {
	  var query = new AV.Query(Comment);
	  query.equalTo('docVersion', docVersion);
	  // query.equalTo('snippetVersion', snippetVersion);
	  query.find({
	    success: function(datas) {
	      // alert('当前评论数: ' + datas.length);
	      // alert(JSON.stringify(datas));
	    }
	  })
	}

	function getComment(){
		var str = [];
		// str.push('<div class="pull-right clearfix">{{title}}</div>');
		var userStr;
		if(currentUser){
			userStr = '<div class="form-group"> <textarea class="form-control comment-content"></textarea></div>';
			userStr += '<div>'+currentUser.username+'<button class="btn btn-sm btn-default create-comment"> 评论</button>'+'</div>';
		}else{
			userStr = '<div><button class="btn btn-sm btn-default" href="'+commentHost+"/users/login"+'" target="_self"> 登录</button></div>';
		}
		str.push('<div class="comment-container">');

		str.push('<div><ul><li>Comment 1</li><li>Comment 2</li></ul></div>');
		str.push(userStr);
		str.push('</div>');
		return str.join('');
	}



	$(document).on('click','.create-comment',createComment)


	function createComment(){
		var commentContent = $(this).parents('.comment-container').find('.comment-content').val();
		var snippetVersion = $(this).parents('[version]').attr('version');
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
		});
	}
	getUser();

	function initCommentHtml(){
		$('#content [version]').append('<div class="toggle-comment">+</div>');
		if($('#comment-container').length<1){
			$(document.body).append('<div id="comment-container" style="width:300px;height:300px;position:absolute;display:none;z-index:999;border:1px solid;background-color:white"></div>');
		}
	}
	function toggleComment(e){
		var	mouseX = e.pageX;
		var mouseY = e.pageY;
		var xoffset = 20;
		var yoffset = 20;
		$('#comment-container').toggle();
		$('#comment-container').css({
			left:mouseX+xoffset,
			top: mouseY+yoffset
		});
	}
	initCommentHtml();
	$(document).on('click','.toggle-comment',function(e){
    toggleComment(e)
	});


});