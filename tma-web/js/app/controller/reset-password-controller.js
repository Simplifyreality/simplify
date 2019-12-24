angular.module('tmweb').controller('ResetPasswordController', ['$scope', '$cookies', 'authService', function($scope, $cookies, authService) {
		$scope.errors = [];
		delete $scope.errorType;
		$scope.resetPassword = function() {
			authService.resetPassword($cookies.EXPIRED_USER, $scope.oldPassword, $scope.newPassword, $scope.confirmPassword, function(error, status) {
				if (status == 400) {
					// Field errors
					$scope.errorType = "VALIDATION";
					$scope.errors = []
					angular.forEach(error.fieldErrors, function(value, e) {
						$scope.errors[value.path] = value.message;
					});
				} else {
					$scope.errorType = "GENERIC";
				}
			});
		}
}]);