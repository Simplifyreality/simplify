angular.module('tmweb').controller('LogoutController', ['$scope', 'authService', function($scope, authService) {
	authService.logout();
}]);