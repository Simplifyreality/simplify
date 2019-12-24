angular.module('tmweb').controller('MomentumStaffController', ['$rootScope', '$scope', '$route', '$location', '$translate', '$routeParams', 'BaseDataService', function($rootScope, $scope, $route, $location, $translate, $routeParams, baseDataService) {
	$scope.list = function() {
		baseDataService.getMomentumNames(function(data) {
			$scope.names = data;
		}, function(error) {
			// do nothing
		});
	};

	$scope.uploadMomentumNames = function() {
		console.log($('#momentumFile').prop('files'));
		if ($('#momentumFile').prop('files') != undefined && $('#momentumFile').prop('files').length > 0) {
			var fd = new FormData();
			fd.append('file', $('#momentumFile').prop('files')[0]);
			baseDataService.uploadMomentumNames(fd, function(data) {
				$route.reload();
			}, function(error, status) {
				$scope.fileUploadError = true;
			}).run();

			/*fd.readAsBinaryString($('#momentumFile').prop('files')[0]);*/
		}
	}
}]);