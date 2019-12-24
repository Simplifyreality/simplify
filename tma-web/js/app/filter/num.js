angular.module('tmweb').filter('num', function() {
    return function(input) {
        if(input == null || input == '') {
            return 0;
        }
        return parseInt(input, 10);
    }
});
