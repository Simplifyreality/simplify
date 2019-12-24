angular.module('tmweb').controller('CleaningController', ['$rootScope', '$scope', '$location', '$routeParams', '$filter', '$interval', '$translate', '$route', 'FaultService', 'FiltersTransmissionService', function($rootScope, $scope, $location, $routeParams, $filter, $interval, $translate, $route, faultService, FiltersTransmissionService) {
  $scope.showFilters = false;

  $scope.list = function(page) {
    // if (page === undefined || page < 0) {
    // 	page = 0;
    // }
    $scope.options = {
      size:50
    };

    // Sort
    if ($routeParams.direction != null) {
      $scope.options.direction = $routeParams.direction;
    } else {
      $scope.options.direction = 'DESC';
    }

    if ($routeParams.sort != null) {
      $scope.options.sort = $routeParams.sort;
    } else {
      $scope.options.sort = 'date';
    }

    if ($routeParams.dateFrom != null) {
      $scope.options.dateFrom = $routeParams.dateFrom;
    }
    if ($routeParams.dateTo != null) {
      $scope.options.dateTo = $routeParams.dateTo;
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
    if ($routeParams.equipment != null) {
      if ($routeParams.equipment instanceof Array) {
        $scope.options.equipment = $routeParams.equipment;
      } else {
        $scope.options.equipment = $routeParams.equipment.split(",");
      }
    }
    if ($routeParams.priority != null) {
      if ($routeParams.priority instanceof Array) {
        $scope.options.priority = $routeParams.priority;
      } else {
        $scope.options.priority = $routeParams.priority.split(",");
      }
    }
    if ($routeParams.severity != null) {
      if ($routeParams.severity instanceof Array) {
        $scope.options.severity = $routeParams.severity;
      } else {
        $scope.options.severity = $routeParams.severity.split(",");
      }
    }
    if ($routeParams.page === undefined || $routeParams.page < 0) {
      $scope.options.page = 0;
    } else {
      $scope.options.page = $routeParams.page;
    }

    // Fetch the faults from the server
    faultService.listFaults(function(data) {
      $scope.results = data;
    }, function(error) {
      alert("FIXME: Create error handler");
    }, $scope.options, true).run();

    $scope.timer = $interval(function(){
      faultService.listFaults(function(data) {
        $scope.results = data;
      }, function(error) {
        console.log('FAULTS:', 'fetching error');
      }, $scope.options, true).run();
    }, 20000);
  };

  $scope.sort = function(column) {
    if ($scope.options.direction == 'DESC' && $scope.options.sort == column) {
      $scope.options.direction = 'ASC';
    } else if ($scope.options.direction == 'ASC' && $scope.options.sort == column) {
      $scope.options.direction = 'DESC';
    } else {
      $scope.options.direction = 'DESC';
    }
    $scope.options.sort = column;
    $location.search($scope.options);
  };

  $scope.exportUrl = function() {
    var url = $rootScope.api + '/faults/export';
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
  };

  $scope.initFilters = function() {
    $scope.filters = {};
    $scope.filters.open = false;
    $scope.filters.inProgress = false;
    $scope.filters.closedFault = false;
    $scope.filters.tmst = false;
    $scope.filters.e300 = false;
    $scope.filters.e320 = false;
    $scope.filters.high = false;
    $scope.filters.medium = false;
    $scope.filters.low = false;
    angular.forEach($scope.options, function(value, key) {
      if (key == 'status') {
        angular.forEach(value, function(value1, i) {
          if (value1.toUpperCase() == 'OPEN') {
            $scope.filters.open = true;
          } else if (value1 == 'ASSIGNED') {
            $scope.filters.inProgress = true;
          } else if (value1 == 'CLOSED') {
            $scope.filters.closedFault = true;
          }
        });
      }
      if (key == 'equipment') {
        angular.forEach(value, function(value1, i) {
          if (value1.toUpperCase() == 'TMST') {
            $scope.filters.tmst = true;
          } else if (value1 == 'E300') {
            $scope.filters.e300 = true;
          } else if (value1 == 'E320') {
            $scope.filters.e320 = true;
          }
        });
      }
      if (key == 'priority') {
        angular.forEach(value, function(value1, i) {
          if (value1.toUpperCase() == 'HIGH') {
            $scope.filters.high = true;
          } else if (value1.toUpperCase() == 'MEDIUM') {
            $scope.filters.medium = true;
          } else if (value1.toUpperCase() == 'LOW') {
            $scope.filters.low = true;
          }
        });
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
      if (key == 'severity') {
        angular.forEach(value, function(value1, i) {
          if (value1.toUpperCase() == 'DEPECHE') {
            $scope.filters.depeche = true;
          } else if (value1 == 'CARNET') {
            $scope.filters.nodepeche = true;
          }
        });
      }
    });
    $scope.switchFilterView('dateFrom');
  };

  $scope.switchFilterView = function(view) {
    $scope.filterView = view;
  };

  $scope.applyFilters = function() {
    $scope.options = {};
    $scope.options['status'] = [];
    $scope.options['priority'] = [];
    $scope.options['severity'] = ['CLEANING'];
    $scope.options['equipment'] = [];
    $scope.options['page'] = 0;

    if ($scope.filters.open) {
      $scope.options['status'].push('OPEN');
    }
    if ($scope.filters.inProgress) {
      $scope.options['status'].push('ASSIGNED');
    }
    if ($scope.filters.closedFault) {
      $scope.options['status'].push('CLOSED');
    }
    if ($scope.filters.tmst) {
      $scope.options['equipment'].push('TMST');
    }
    if ($scope.filters.e300) {
      $scope.options['equipment'].push('E300');
    }
    if ($scope.filters.e320) {
      $scope.options['equipment'].push('E320');
    }
    if ($scope.filters.high) {
      $scope.options['priority'].push('HIGH');
    }
    if ($scope.filters.medium) {
      $scope.options['priority'].push('MEDIUM');
    }
    if ($scope.filters.low) {
      $scope.options['priority'].push('LOW');
    }
    if ($scope.filters.dateFrom != null) {
      $scope.options['dateFrom'] = $scope.filters.dateFrom;
    }
    if ($scope.filters.dateTo != null) {
      $scope.options['dateTo'] = $scope.filters.dateTo;
    }
    if ($scope.filters.setNumbers != null) {
      $scope.options['setNumbers'] = $scope.filters.setNumbers;
    }

    $scope.showFilters = false;
    $location.search($scope.options);
  };

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
  };

  $scope.addFilter = function(key, model) {
    if ($scope.filters[key] === undefined) {
      $scope.filters[key] = [$scope[model]];
    } else {
      $scope.filters[key].push($scope[model]);
    }
    delete $scope[model];
  };

  $scope.showFilterModal = function() {
    $scope.initFilters();
    $scope.showFilters = true;
  };

  $scope.hideFilterModal = function() {
    $scope.showFilters = false;
  };

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
  };

  $scope.changeTab = function(tab) {
    $scope.options.page = 0;
    $location.search($scope.options);
  };

  $scope.showAssignModal = function() {
    $scope.assignModal = {
      fault: {
        priority: -1,
        status: -1
      }
    };
    $('#assignModal').foundation('reveal', 'open');
  };

  $scope.closeAssignModal = function() {
    $('#assignModal').foundation('reveal', 'close');
  };

  $scope.updatedSuccess = 0;
  $scope.saveAssignDetails = function() {
    //console.log('Data to save:', $scope.assignModal.fault);
    //console.log('Checked:', $scope.data.checked);

    if (!$scope.data.checked)
      return;

    angular.forEach($scope.data.checked, function(id, i) {
      faultService.updateFaultStatus(id, $scope.assignModal.fault, function (data) {
        ++$scope.updatedSuccess;
        if ($scope.data.checked.length == $scope.updatedSuccess) {
          $scope.closeAssignModal();
          $route.reload();
        }
      }, function (error, status) {
        console.log(error, status);
      }).run();
    });
  };

  $scope.priority = [
    { value: -1, disabled: true, name: $translate('faults.select.priority') },
    { value: 'HIGH', name: 'HIGH' },
    { value: 'MEDIUM', name: 'MEDIUM' },
    { value: 'LOW', name: 'LOW' }
  ];
  $scope.status = [
    { value: -1, disabled: true, name: $translate('faults.select.status') },
    { value: 'OPEN', name: 'OPEN' },
    { value: 'ASSIGNED', name: 'ASSIGNED' },
    { value: 'CLOSED', name: 'CLOSED' }
  ];

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

  $scope.data = {
    checked: []
  };

  $scope.$watch('data.checked',function(list){
    //if (!$scope.results)
    //    return;
    //
    //if (list.length < $scope.results.content.length) {
    //    var t = list;
    //    $scope.checkedAll = false;
    //    $scope.data.checked = t;
    //    console.log('test:', t);
    //} else {
    //    $scope.checkedAll = true;
    //}
  }, true);

  $scope.$watch('checkedAll',function(checked, prev){
    $scope.data.checked = [];
    if (checked) {
      angular.forEach($scope.results.content, function(v, i) {
        $scope.data.checked.push(v.id);
      });
    }
  });

  $scope.$on('$destroy', function(){
    if ($scope.timer) {
      $interval.cancel($scope.timer);
    }
  });
  FiltersTransmissionService.setFilter('cleaningControllers', $location.url());
}]);
