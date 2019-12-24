angular.module('tmweb').controller('TrainObjectivesController', ['$scope', '$route', '$translate', '$routeParams', '$location', '$filter', 'TrainObjectiveService', function($scope, $route, $routeParams, $translate, $location, $filter, trainObjectiveService) {

	$scope.list = function() {
		
		$scope.options = {
			size:50
		};
		if ($routeParams.dateFrom != null) {
			$scope.options.dateFrom = $routeParams.dateFrom;
		}
		if ($routeParams.dateTo != null) {
			$scope.options.dateTo = $routeParams.dateTo;
		}

		if ($routeParams.page === undefined || $routeParams.page < 0) {
			$scope.options.page = 0;
		} else {
			$scope.options.page = $routeParams.page;
		}
		// Fetch the journeys from the server
		trainObjectiveService.list($scope.options, function(data) {
			$scope.results = data;
		}, function(error) {
			console.log(error);
		}, $scope.options);
	}

	$scope.showTitle = function(s) {
		if (s['en'] != undefined) {
			return s['en'].title;
		} else if (s['fr'] != undefined) {
			return s['fr'].title;
		} else if (s['nl'].title != undefined) {
			return s['nl'].title;
		}
	}

	$scope.newTrainObjective = function() {
		$scope.trainObjectivesModal = {
			isNewTrainObjective:true,
			trainObjective: {
				scripts: {
					en: {},
					fr: {},
					nl: {}
				}
			}
		}
		$scope.resetErrors();
		$('#trainObjectivesModal').foundation('reveal', 'open');
	};

	$scope.removeTrainObjective = function(objective) {
		if (confirm("Are you sure you want to delete this train objective?") == true) {
			trainObjectiveService.remove(objective.id ,function() {
				$scope.resetErrors();
				//$scope.objectiveRemoved = objective;
			}, function() {
				$scope.resetErrors();
			}).run();
			$route.reload();
		}
	}

	$scope.editTrainObjective = function(t) {
		var model = {}
		angular.copy(t, model);
		model.to = $filter('date')(model.to, 'dd-MM-yyyy');
		model.from = $filter('date')(model.from, 'dd-MM-yyyy');
		if (model.scripts['en'] === undefined) {
			model.scripts['en'] = {};
		}
		if (model.scripts['fr'] === undefined) {
			model.scripts['fr'] = {};
		}
		if (model.scripts['nl'] === undefined) {
			model.scripts['nl'] = {};
		}
		$scope.trainObjectivesModal = {
			isNewTrainObjective:false,
			trainObjective: model
			// trainObjective: {
			// 	id: t.id,
			// 	to: $filter('date')(t.to, 'dd-MM-yyyy'),
			// 	from: $filter('date')(t.from, 'dd-MM-yyyy'),
			// 	scripts: {
			// 		en: {
			// 			title: t.scripts['en'] ? t.scripts['en'].title : "",
			// 			text: t.scripts['en']  ? t.scripts['en'].script : ""
			// 		},
			// 		fr: {
			// 			title: t.scripts['fr'] ? t.scripts['fr'].title : "",
			// 			text: t.scripts['fr'] ? t.scripts['fr'].script : ""
			// 		},
			// 		nl: {
			// 			title: t.scripts['nl'] ? t.scripts['nl'].title : "",
			// 			text: t.scripts['nl'] ? t.scripts['nl'].script : ""
			// 		}
			// 	}
			// }
		}
		$scope.resetErrors();
		$('#trainObjectivesModal').foundation('reveal', 'open');
	};

	$scope.saveTrainObjective = function() {
		var isNew = $scope.trainObjectivesModal.isNewTrainObjective;
		var t = $scope.trainObjectivesModal.trainObjective;
		$scope.resetErrors();
		var success = function(data) {
			$scope.resetErrors(); // reset all errors first...
			$scope.list();
			if (isNew) {
				$scope.trainObjectiveAdded = t;
			} else {
				$scope.trainObjectiveUpdate = t;
			}
			$scope.cancelModal();
			$route.reload();
		};
		var error = function(error, status) {
			console.log(error);
			$scope.resetErrors(); // reset all errors first...
			if (status == 400) {
				$scope.errorType = "VALIDATION"
				angular.forEach(error.fieldErrors, function(err, i) {
					$scope.errors[err.path] = err.message;
				});
			} else {
				$scope.specialModal.isGenericError = true;
			}
		}
		// Create or update
		if (isNew) {
			trainObjectiveService.create(t, success, error).run();
		} else {
			trainObjectiveService.update(t, success ,error).run();
		}
	}

	$scope.cancelModal = function() {
		$('#trainObjectivesModal').foundation('reveal', 'close');
	};

	$scope.resetErrors = function() {
		$scope.errors = [];
		delete $scope.objectiveRemoved;
		delete $scope.errorType;
	}


	$scope.initFilters = function() {
		$scope.filters = {};
		$scope.filters.dateFrom  = $scope.options.dateFrom ? $scope.options.dateFrom : "";
		$scope.filters.dateTo = $scope.options.dateTo ? $scope.options.dateTo : "";
		$scope.switchFilterView('dateFrom');
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

	$scope.switchFilterView = function(view) {
		$scope.filterView = view;
	}

	$scope.applyFilters = function() {
		$scope.options = {};
		if ($scope.filters.dateFrom != null && $scope.filters.dateFrom != "") {
			$scope.options.dateFrom  = $scope.filters.dateFrom;
		}
		if ($scope.filters.dateTo != null && $scope.filters.dateTo != "") {
			$scope.options.dateTo = $scope.filters.dateTo;
		}
		$scope.showFilters = false;
		$location.search($scope.options);
	}

	// filters....
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