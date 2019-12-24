angular.module('tmweb').service('BoardingService', ['$rootScope', 'HttpQueue', function($rootScope, HttpQueue) {
    return {
        listBoarding: function(success, error, options) {
            if (options === undefined) {
                options = {page: 0, size: 50};
            }
            return HttpQueue.get($rootScope.api + "/boarding", {params:options}).success(success).error(error);
        },
        boardingDetails: function(id, success, error) {
            return HttpQueue.get($rootScope.api + "/boarding/" + id).success(success).error(error);
        }
    }
}]);