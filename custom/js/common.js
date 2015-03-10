

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



// doc search
$(function() {
    $(".search-form input").keyup(function(event) {
        if ($(event).keyCode == 13) {
            $(this).parents("form.search-form").submit()
        }
    });
});



