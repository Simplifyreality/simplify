angular.module('tmweb').controller('IssuesController', ['$rootScope', '$scope', '$filter', '$routeParams', '$location', 'IssueService', 'IssueCategoryService', 'FiltersTransmissionService', function ($rootScope, $scope, $filter, $routeParams, $location, issueService, issueCategoryService, FiltersTransmissionService) {
    // Click a button
    $scope.list = function () {
        $scope.options = {
            size: 50
        };
        if ($routeParams.dateFrom != null) {
            $scope.options.dateFrom = $routeParams.dateFrom;
        }
        if ($routeParams.dateTo != null) {
            $scope.options.dateTo = $routeParams.dateTo;
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
        if ($routeParams.category != null) {
            $scope.options.category = $routeParams.category;
        }
        if ($routeParams.subcategory != null) {
            $scope.options.subcategory = $routeParams.subcategory;
        }

        if ($routeParams.page === undefined || $routeParams.page < 0) {
            $scope.options.page = 0;
        } else {
            $scope.options.page = $routeParams.page;
        }
        if ($scope.options.page === undefined || $scope.options.page < 0) {
            $scope.options.page = 0;
        }
        // Fetch the journeys from the server
        issueService.listIssues(function (data) {
            $scope.results = data;
        }, function (error) {
            alert("FIXME: Create error handler");
        }, $scope.options).run();

        // categories for filter
        issueCategoryService.listCategories(function (data) {
            $scope.categories = $.merge([
                {id:"",title_en:""}
            ], data);
            for(var catIndex in $scope.categories) {
                if ($scope.categories[catIndex].subCategories) {
                    $scope.categories[catIndex].subCategories = $.merge([
                        {id:"",title_en:""}
                    ], $scope.categories[catIndex].subCategories);
                }
            };
            if ($routeParams.category != null) {
                var selectedCategory = $filter('filter')($scope.categories, {title_en: $routeParams.category}, true);
                if (selectedCategory && selectedCategory.length) {
                    $scope.selectedCategory = selectedCategory[0];
                    if ($routeParams.subcategory != null) {
                        var selectedSubCategory = $filter('filter')(selectedCategory[0].subCategories, {title_en: $routeParams.subcategory}, true);
                        if (selectedSubCategory && selectedSubCategory.length) {
                            $scope.selectedSubCategory = selectedSubCategory[0];
                        }
                    }
                }
            }
        }, function (error, status) {
            alert("Error from server");
        }).run();
    }

    $scope.exportUrl = function () {
        var url = $rootScope.api + '/issues/export';
        var i = 0;
        angular.forEach($scope.options, function (value, key) {
            if (i == 0) {
                url += ("?" + key + "=" + value);
            } else {
                url += ("&" + key + "=" + value);
            }
            i++;
        });
        return url
    };

    $scope.initFilters = function () {
        $scope.filters = {};
        $scope.filters.started = false;
        $scope.filters.submitted = false;
        $scope.filters.category = "";
        $scope.filters.subcategory = "";
        angular.forEach($scope.options, function (value, key) {
            if (key == 'status') {
                angular.forEach(value, function (value1, i) {
                    if (value1.toUpperCase() == 'STARTED') {
                        $scope.filters.started = true;
                    } else if (value1.toUpperCase() == 'SUBMITTED') {
                        $scope.filters.submitted = true;
                    }
                })
            } else if (key == 'category') {
                $scope.filters.category = $scope.selectedCategory;
            } else if (key == 'subcategory') {
                $scope.filters.subcategory = $scope.selectedSubCategory;
            } else {
                if ($scope.options[key] instanceof Array) {
                    $scope.filters[key] = [];
                    angular.forEach(value, function (value1, i) {
                        $scope.filters[key].push(value1);
                    });
                } else {
                    $scope.filters[key] = $scope.options[key];
                }
            }
        });

        if (!$scope.options.category) {
            $scope.filters.category = $scope.categories[0];
        }
        if ($scope.filters.category.id && !$scope.options.subcategory) {
            $scope.filters.subcategory = $scope.filters.category.subCategories[0];
        }

        $scope.switchFilterView('dateFrom');
    }

    $scope.switchFilterView = function (view) {
        $scope.filterView = view;
    }

    $scope.applyFilters = function () {
        $scope.options = {};
        $scope.options['status'] = [];
        $scope.options['category'] = [];
        $scope.options['subcategory'] = [];

        if ($scope.filters.started) {
            $scope.options['status'].push('STARTED');
        }
        if ($scope.filters.submitted) {
            $scope.options['status'].push('SUBMITTED');
        }
        if ($scope.filters.category) {
            $scope.options['category'] = $scope.filters.category.title_en;
        }
        if ($scope.filters.subcategory) {
            $scope.options['subcategory'] = $scope.filters.subcategory.title_en;
        }
        angular.forEach($scope.filters, function (value, key) {
            if (key == 'started' || key == 'submitted' || key == 'category' || key == 'subcategory') {
                return;
            }
            $scope.options[key] = ((key !== 'page') ? value : 0);
        });

        $scope.showFilters = false;
        $location.search($scope.options);
    }

    $scope.removeSelectedFilter = function (key, value) {
        if (value === undefined) {
            delete $scope.options[key];
        } else {
            // Cross browser
            var newValues = [];
            angular.forEach($scope.options[key], function (v, i) {
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
        if (key == 'category' && $scope.options.subcategory) {
            $scope.removeSelectedFilter('subcategory');
        } else {
            $location.search($scope.options);
        }
    }

    $scope.removeFilter = function (key, value) {
        if (value === undefined) {
            delete $scope.filters[key];
        } else {
            // Cross browser
            var newValues = [];
            angular.forEach($scope.filters[key], function (v, i) {
                if (v == value) {
                    return;
                }
                newValues.push(v);
            });
            $scope.filters[key] = newValues;
        }
    }

    $scope.addFilter = function (key, model) {
        if ($scope.filters[key] == null) {
            $scope.filters[key] = [$scope[model]];
        } else {
            $scope.filters[key].push($scope[model]);
        }
        console.log('filters:', $scope.filters[key]);
        delete $scope[model];
    }

    // filters....
    $scope.showFilterModal = function () {
        $scope.initFilters();
        $scope.showFilters = true;
    }

    $scope.hideFilterModal = function () {
        $scope.showFilters = false;
    }

    $scope.changePage = function (page) {
        if (page < 0) {
            page = 0;
        }
        if ($scope.options === undefined) {
            $scope.options = {size: 55, page: page};
        } else {
            $scope.options.page = page;
        }
        $location.search($scope.options);
    }

    $scope.changeFilterCategory = function() {
        if ($scope.filters.category.id) {
            $scope.filters.subcategory = $scope.filters.category.subCategories[0];
        } else {
            $scope.filters.subcategory = null;
        }
    }

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

    FiltersTransmissionService.setFilter('issueControllers', $location.url());
}]);
