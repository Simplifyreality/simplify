angular.module('tmweb').controller('SpecialsController', ['$scope', '$route', '$location', '$routeParams', 'AnnouncementService', function($scope, $route, $location, $routeParams, announcementService) {

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
		if ($routeParams.trainNumber != null) {
			if ($routeParams.trainNumber instanceof Array) {
				$scope.options.trainNumber = $routeParams.trainNumber;
			} else {
				$scope.options.trainNumber = $routeParams.trainNumber.split(",");
			}
		}
		if ($routeParams.page === undefined || $routeParams.page < 0) {
			$scope.options.page = 0;
		} else {
			$scope.options.page = $routeParams.page;
		}
		announcementService.listSpecialAnnouncements($scope.options, function(data) {
			$scope.specials = data;
			if ($scope.options.page > 0 && data.content.length == 0) {
				$scope.options.page -= 1;
				$location.search($scope.options);
			}
		}, function(error, status) {
			alert("there was an error");
		}).run();
	}

	$scope.initFilters = function() {
		$scope.filters = {};
		angular.forEach($scope.options, function(value, key) {
			if ($scope.options[key] instanceof Array) {
				$scope.filters[key] = [];
				angular.forEach(value, function(value1, i) {
					$scope.filters[key].push($scope.options[key][i]);
				});
			} else {
				$scope.filters[key] = $scope.options[key];
			}
		
		});
		$scope.switchFilterView('dateFrom');
	}

	$scope.switchFilterView = function(view) {
		$scope.filterView = view;
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

	$scope.addFilter = function(key, model) {
		if ($scope.filters[key] === undefined) {
			$scope.filters[key] = [$scope[model]];
		} else {
			$scope.filters[key].push($scope[model]);
		}
		delete $scope[model];
	}

	$scope.applyFilters = function() {
		$scope.options = {};
		angular.forEach($scope.filters, function(filter, key) {
			$scope.options[key] = filter;
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
			$scope.options = { size:50, page: page};
		} else {
			$scope.options.page = page;
		}
		$location.search($scope.options);
	}

	$scope.saveSpecial = function() {
		$scope.resetErrors();
		var success = function(data) {
			$scope.resetErrors(); // reset all errors first...
			$scope.list();
			var isNewSpecial = $scope.specialModal.isNewSpecial;
			if (isNewSpecial) {
				$scope.specialAdded = $scope.specialModal.special;
			} else {
				$scope.specialUpdated = $scope.specialModal.special;
			}
			$scope.cancelModal();
		};
		var error = function(error, status) {
			$scope.resetErrors(); // reset all errors first...
			if (status == 400) {
				$scope.specialModal.isValidationError = true;
				angular.forEach(error.fieldErrors, function(e, i) {
					$scope.specialModal.errors[e.path] = e.message;
				});
			} else {
				$scope.specialModal.isGenericError = true;
			}
		}

		// Setup train numbers
		$scope.specialModal.special.trainNumbers = $scope.specialModal.trainNumbers;
		// Create or update
		if ($scope.specialModal.isNewSpecial) {
			announcementService.createSpecialAnnouncement($scope.specialModal.special, success, error).run();
		} else {
			announcementService.updateSpecialAnnouncement($scope.specialModal.special, success ,error).run();
		}
	}

	$scope.newSpecial = function() {
		$scope.specialModal = {
			isNewSpecial:true,
			special: {
				script: {
					'en': { title: '', script: ''},
					'fr': { title: '', script: ''},
					'nl': {},
					'de': {}
				}
			},
			trainNumbers:[]
		}
		$('#specialModal').foundation('reveal', 'open');
	};

	$scope.editSpecial = function(special) {

		var model = {}

		// Copy the object
		angular.copy(special, model);

		if (model.script['en'] === undefined) {
			model.script['en'] = {};
		}
		if (model.script['fr'] === undefined) {
			model.script['fr'] = {};
		}
		if (model.script['nl'] === undefined) {
			model.script['nl'] = {};
		}
		if (model.script['de'] === undefined) {
			model.script['de'] = {};
		}

		$scope.specialModal = {
			isNewSpecial:false,
			special: model,
			trainNumbers:[]
		}
		
		angular.forEach(special.trainNumbers, function(t, i) {
			$scope.specialModal.trainNumbers.push(t);
		});
		$('#specialModal').foundation('reveal', 'open');
	}

	$scope.addTrainNumber = function() {
		if ($scope.specialModal.trainNumberToAdd === undefined || !$scope.specialModal.trainNumberToAdd.match(/^(90\d\d|91\d\d|90\*|91\*)$/)) {
			$scope.specialModal.trainNumberToAdd = '';
			return;
		}
		if ($scope.specialModal.trainNumbers === undefined) {
			$scope.specialModal.trainNumbers = [];
		}
		$scope.specialModal.trainNumbers.push($scope.specialModal.trainNumberToAdd);
		$scope.specialModal.trainNumberToAdd = '';
	}

	$scope.removeTrainNumber = function(t) {
		var trains = [];
		angular.forEach($scope.specialModal.trainNumbers, function(t1, i) {
			if (i == t) {
				return;
			}
			trains.push($scope.specialModal.trainNumbers[i]);
		});
		$scope.specialModal.trainNumbers = trains;
	}

	$scope.cancelModal = function() {
		$('#specialModal').foundation('reveal', 'close');
	};

	$scope.initDailyOrder = function() {
		announcementService.getDailyOrder(function(data) {
			$scope.dailyOrderFile = data;
		}, function(error, status) {
			alert("error");
		}).run();
	}

	$scope.uploadDailyOrder = function() {
		if ($('#dailyOrderFile').prop('files') != undefined && $('#dailyOrderFile').prop('files').length > 0) {
			announcementService.uploadDailyOrder($('#dailyOrderFile').prop('files')[0], function(data) {
				$location.search($scope.options);
			}, function(error, status) {
				$scope.fileUploadError = true;
			}).run();
		}
	}

	$scope.deleteSpecial = function(special) {
		announcementService.deleteSpecial(special.id, function(data) {
			console.log("deleted");
			$route.reload();
		}, function(error, status) {

		}).run();
	}

	$scope.resetErrors = function() {
		$scope.isValidationError = false;
		$scope.isGenericError = false;
		$scope.specialModal.isValidationError = false;
		$scope.specialModal.isGenericError = false;
		$scope.specialModal.errors = {};
		$scope.specialAdded = false;
		$scope.specialUpdated = false;
	}
}]);