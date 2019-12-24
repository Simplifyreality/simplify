angular.module('tmweb').controller('LoginController', ['$scope', 'authService', function($scope, authService) {
		$scope.login = function() {
			authService.login($scope.username, $scope.password);
		}
}]);