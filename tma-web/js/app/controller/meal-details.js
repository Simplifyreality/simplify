angular.module('tmweb').controller('MealDetailsController', ['$rootScope', '$scope', '$location', '$routeParams', '$window', '$filter', 'BoardingService', 'FiltersTransmissionService', function($rootScope, $scope, $location, $routeParams, $window, $filter, BoardingService, FiltersTransmissionService) {

	$scope.bordingData = {
		firsthalf : {
			bp: null,
			bpTotal: null,
			sp:null,
			spTotal: null,
			total: null
		},
		lasthalf : {
			bp: null,
			bpTotal: null,
			sp:null,
			spTotal: null,
			total: null
		},
		total : null
	};

	function remakeData(data) {

		var newData = {};

		newData.f = data.filter(function(item) {
			return item.firstHalfSet == true;
		});

		$scope.bordingData.firsthalf.bp = newData.f.filter(function(item) {
			return item.coachType == 'BP';
		});

		$scope.bordingData.firsthalf.sp = newData.f.filter(function(item) {
			return item.coachType == 'SP';
		});
		
		$scope.bordingData.firsthalf.bp.forEach(function (el) {
			$scope.bordingData.firsthalf.bpTotal += el.joiners;
			$scope.bordingData.firsthalf.bpTotal += el.boarded;
		});
		
		$scope.bordingData.firsthalf.sp.forEach(function (el) {
			$scope.bordingData.firsthalf.spTotal += el.joiners;
			$scope.bordingData.firsthalf.spTotal += el.boarded;
		});

		$scope.bordingData.firsthalf.total = $scope.bordingData.firsthalf.bpTotal + $scope.bordingData.firsthalf.spTotal
		
		newData.l = data.filter(function(item) {
			return item.firstHalfSet == false;
		});

		$scope.bordingData.lasthalf.bp = newData.l.filter(function(item) {
			return item.coachType == 'BP';
		});

		$scope.bordingData.lasthalf.sp = newData.l.filter(function(item) {
			return item.coachType == 'SP';
		});
		
		$scope.bordingData.lasthalf.bp.forEach(function (el) {
			$scope.bordingData.lasthalf.bpTotal += el.joiners;
			$scope.bordingData.lasthalf.bpTotal += el.boarded;
		});
		
		$scope.bordingData.lasthalf.sp.forEach(function (el) {
			$scope.bordingData.lasthalf.spTotal += el.joiners;
			$scope.bordingData.lasthalf.spTotal += el.boarded;
		});
		
		$scope.bordingData.lasthalf.total = $scope.bordingData.lasthalf.bpTotal + $scope.bordingData.lasthalf.spTotal

		$scope.bordingData.total = $scope.bordingData.firsthalf.total + $scope.bordingData.lasthalf.total
		
		console.log($scope.bordingData);
	}

	BoardingService.boardingDetails($routeParams.boardingId,function(response) {
		remakeData(response);
	});

  $scope.viewAll = FiltersTransmissionService.getFilter('mealControllers');
}]);
