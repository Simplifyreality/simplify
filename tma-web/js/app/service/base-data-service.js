angular.module('tmweb').service('BaseDataService', ['$rootScope', 'HttpQueue', function($rootScope, HttpQueue) {
	return {
		uploadMomentumNames: function(fileData, success, error) {
			console.log(fileData);
			return HttpQueue.post($rootScope.api + "/momentum", fileData, {transformRequest: angular.identity,headers: {"Content-Type": undefined}}).success(success).error(error);
		},
		getMomentumNames: function(success, error) {
			return HttpQueue.get($rootScope.api + "/momentum").success(success).error(error);
		}
	};
}]);