var pres = document.getElementsByTagName("pre");
for (var i = 0; i < pres.length; i++) {
    pres[i].className = "prettyprint";

}




$(function() {
    $("#ios_version").text($sdk_versions.ios);
    $("#osx_version").text($sdk_versions.osx);
    $("#android_version").text($sdk_versions.android);
    $("#js_version").text($sdk_versions.javascript);
});

$(function() {
    $(".search-form input").keyup(function(event) {
        if ($(event).keyCode == 13) {
            $(this).parents("form.search-form").submit()
        }
    });
});

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

$(function(){
  $("#ios_version").text($sdk_versions.ios);
  $("#osx_version").text($sdk_versions.osx);
  $("#android_version").text($sdk_versions.android);
  $("#js_version").text($sdk_versions.javascript);
  $("#unity3d_version").text($sdk_versions.unity3d);
  $("#wp_version").text($sdk_versions.wp);
});

$(function() {
  var arr = $('#toc ul').parents('li');
  angular.forEach(arr, function(v, k) {
    var a = $(v).children('a:first-child');
    a.addClass('has-subdoc-nav');
  });

  $(".sidebar-wrapper #toc").append("<li class=back-to-top><a href=#top>返回顶部</a></li>");
});

// $('body').scrollspy({ target: '.sidebar-wrapper' });
// $('body').scrollspy({ target: '.bs-docs-sidebar' });
// $('[data-spy="scroll"]').each(function () {
//   var $spy = $(this).scrollspy('refresh')
// })
