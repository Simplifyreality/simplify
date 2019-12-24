angular.module('tmweb').service('AppService', ['$rootScope', 'HttpQueue', function($rootScope, HttpQueue) {
	return {
		getVersion: function(success, error, id) {
			return HttpQueue.get($rootScope.api + "/version").success(success).error(error);
		},
		getWebVersion: function(success, error) {
			return HttpQueue.get("version.txt").success(success).error(error);
		}
	}
}]);