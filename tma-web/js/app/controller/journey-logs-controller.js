angular.module('tmweb').controller('JourneyLogsController', ['$rootScope', '$scope', '$location', '$routeParams', '$filter', 'JourneyService', function($rootScope, $scope, $location, $routeParams, $filter, journeyService) {
	$scope.showFilters = false;
	// Click a button
	$scope.list = function() {
		$scope.options = {
			size:55
		};
		if ($routeParams.dateFrom != null) {
			$scope.options.dateFrom = $routeParams.dateFrom;
		} else { 
			var date = new Date();
			$scope.options.dateFrom = $filter('date')(date, 'dd-MM-yyyy');
		}
		if ($routeParams.dateTo != null) {
			$scope.options.dateTo = $routeParams.dateTo;
		} else {
			var date = new Date();
			$scope.options.dateTo = $filter('date')(date, 'dd-MM-yyyy');
		}
		if ($routeParams.trainNumbers != null) {
			if ($routeParams.trainNumbers instanceof Array) {
				$scope.options.trainNumbers = $routeParams.trainNumbers;
			} else {
				$scope.options.trainNumbers = $routeParams.trainNumbers.split(",");
			}
		}
		if ($routeParams.setNumbers != null) {
			if ($routeParams.setNumbers instanceof Array) {
				$scope.options.setNumbers = $routeParams.setNumbers;
			} else {
				$scope.options.setNumbers = $routeParams.setNumbers.split(",");
			}
		}
		if ($routeParams.status != null) {
			if ($routeParams.status instanceof Array) {
				$scope.options.status = $routeParams.status;
			} else {
				$scope.options.status = $routeParams.status.split(",");
			}
		}
		if ($routeParams.page === undefined || $routeParams.page < 0) {
			$scope.options.page = 0;
		} else {
			$scope.options.page = $routeParams.page;
		}
		// Fetch the journeys from the server
		journeyService.listJourneys(function(data) {
			$scope.results = data;
		}, function(error) {
			alert("FIXME: Create error handler");
		}, $scope.options);
	};

	$scope.exportUrl = function() {
		var url = $rootScope.api + '/journeys/export';
		var i = 0;
		angular.forEach($scope.options, function(value, key) {
			if (i == 0) {
				url += ("?" + key + "=" + value);
			} else {
				url += ("&" + key + "=" + value);
			}
			i++;
		});
		return url
	};

	$scope.initFilters = function() {
		$scope.filters = {};
		$scope.filters.started = false;
		$scope.filters.submitted = false;
		angular.forEach($scope.options, function(value, key) {
			if (key == 'status') {
				angular.forEach(value, function(value1, i) {
					if (value1.toUpperCase() == 'STARTED') {
						$scope.filters.started = true;
					} else if (value1.toUpperCase() == 'SUBMITTED') {
						$scope.filters.submitted = true;
					}
				})
			} else {
				if ($scope.options[key] instanceof Array) {
					$scope.filters[key] = [];
					angular.forEach(value, function(value1, i) {
						$scope.filters[key].push(value1);
					});
				} else {
					$scope.filters[key] = $scope.options[key];
				}
			}
		});
		$scope.switchFilterView('dateFrom');
	}

	$scope.switchFilterView = function(view) {
		$scope.filterView = view;
	}

	$scope.removeSelectedFilter = function(key, value) {
		if (value === undefined) {
			delete $scope.options[key];
		} else {
			// Cross browser
			var newValues = [];
			angular.forEach($scope.options[key], function(v, i) {
				if (v == value) {
					return;
				}
				newValues.push(v);
			});
			if (newValues.length == 0) {
				delete $scope.options[key];
			} else {
				$scope.options[key] = newValues;
			}
		}
		$location.search($scope.options);
	}

	$scope.removeFilter = function(key, value) {
		if (value === undefined) {
			delete $scope.filters[key];
		} else {
			// Cross browser
			var newValues = [];
			angular.forEach($scope.filters[key], function(v, i) {
				if (v == value) {
					return;
				}
				newValues.push(v);
			});
			$scope.filters[key] = newValues;
		}
	}

	$scope.addFilter = function(key, model) {
		if ($scope.filters[key] === undefined) {
			$scope.filters[key] = [$scope[model]];
		} else {
			$scope.filters[key].push($scope[model]);
		}
		console.log($scope.filters[key]);
		delete $scope[model];
	}


	$scope.applyFilters = function() {
		$scope.options = {};
		$scope.options['status'] = [];

		if ($scope.filters.started) {
			$scope.options['status'].push('STARTED');
		}
		if ($scope.filters.submitted) {
			$scope.options['status'].push('SUBMITTED');
		}
		angular.forEach($scope.filters, function(value, key) {
			if (key == 'started' || key == 'submitted') {
				return;
			}
			$scope.options[key] = value;
		});
		$scope.showFilters = false;
		$location.search($scope.options);
	}

	$scope.showFilterModal = function() {
		$scope.initFilters();
		$scope.showFilters = true;
	}

	$scope.hideFilterModal = function() {
		$scope.showFilters = false;
	}

	$scope.changePage = function(page) {
		if (page < 0) {
			page = 0;
		}
		if ($scope.options === undefined) {
			$scope.options = { size:55, page: page};
		} else {
			$scope.options.page = page;
		}
		$location.search($scope.options);
	}
}]);