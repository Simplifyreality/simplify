angular.module('tmweb').controller('ViewFaultController', ['$rootScope', '$scope', '$route', '$location', '$translate', '$routeParams', '$window', 'FaultService', 'FiltersTransmissionService', function($rootScope, $scope, $route, $location, $translate, $routeParams, $window, faultService, FiltersTransmissionService) {

	// Expected Fields:
	// assignedDepot
	// priority
	// status
	// depot comments
	$scope.faultStatus = {
		assignedDepot: -1,
		priority: -1,
		status: -1
	};

	$scope.depots = [{
		value: -1, disabled:true, name: $translate('faults.select.depot')
	},
	{
		value:'TMI', name:'TMI'
	},
	{
		value:'Forest', name:'Forest'
	},
	{
		value:'Le Landy', name:'Le Landy'
	}];
	$scope.priority = [{
		value: -1, disabled:true, name: $translate('faults.select.priority')
	}, 
	{
	 	value:'HIGH', name:'HIGH'
	},
	{
		value:'MEDIUM', name:'MEDIUM'
	},
	{
		value:'LOW', name:'LOW'
	}];
	$scope.status = [{
		value: -1, disabled:true, name: $translate('faults.select.status')
	},
	{
	 	value:'OPEN', name:'OPEN'
	},
	{
		value:'ASSIGNED', name:'ASSIGNED'
	},
	{
		value:'CLOSED', name:'CLOSED'
	}];
	faultService.fetchFault(function(data) {
		$scope.fault = data;

		if ($scope.fault.assignedDepot != null) {
			$scope.faultStatus.assignedDepot = $scope.fault.assignedDepot;
		}
		if ($scope.fault.assignmentPriority != null) {
			$scope.faultStatus.priority = $scope.fault.assignmentPriority;
		}
		if ($scope.fault.assignmentStatus != null) {
			$scope.faultStatus.status = $scope.fault.assignmentStatus;
		}
		$scope.faultStatus.depotComments = $scope.fault.depotComments;

	}, function(error) {}, $routeParams.id).run();

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
		});
		return isPermitted;
	};

    $scope.$watch('fault.depotComment', function(val) {
        $scope.faultStatus.depotComments = val;
    });

    $scope.save = function() {
		faultService.updateFaultStatus($scope.fault.id, $scope.faultStatus, function(data) {
			$scope.issueUpdated = true;
			$scope.isValidationError = false;
			$route.reload();
		}, function(error, status) {
			$scope.issueUpdated = false;
			$scope.isValidationError = true;
			angular.forEach(error.fieldErrors, function(e, i) {
				$scope.errors[e.path] = e.message;
			});
		}).run();
	};

    $scope.viewAll = FiltersTransmissionService.getFilter('faultControllers');

}]);
