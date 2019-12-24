angular.module('tmweb').controller('NavigationController', ['$rootScope', '$scope', function($rootScope, $scope) {
	$scope.isCollapsed = false;

	$scope.hasPermission = function(permission) {
		if ($rootScope.user === undefined || $rootScope.user.permissions === undefined) {
			return false;
		}
		var isPermitted = false;
		angular.forEach($rootScope.user.permissions, function(p, i) {
			if (p.toUpperCase() == permission.toUpperCase()) {
				isPermitted = true;
				return;
			}
			// check emessage tab permission
      if(permission === 'ROLE_EMESSAGE') {
				// check any emessage user permission
        if(p.toUpperCase().indexOf('ROLE_EMESSAGE') > -1) {
          isPermitted = true;
        }
      }
		});
		return isPermitted;
	};

	$scope.openAdmin = function() {
		if (!$scope.adminMenuOpen) {
			$('.lt-ie9 #adminMenu').removeClass('hover').addClass('hover');
			$scope.adminMenuOpen = true;
		} else {
			$('.lt-ie9 #adminMenu').removeClass('hover');
			$scope.adminMenuOpen = false;
		}
		$('.lt-ie9 #adminDropDown li > a').click(function() {
			$('#adminMenu').removeClass('hover');
			$scope.adminMenuOpen = false;
		});
	}
}]);