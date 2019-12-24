angular.module('tmweb').controller('EMessageController', ['$rootScope', '$scope', '$routeParams', '$location', '$anchorScroll', '$interval', '$filter', '$timeout', '$route', 'MessageService',
    function($rootScope, $scope, $routeParams, $location, $anchorScroll, $interval, $filter, $timeout, $route, messageService) {

        $scope.eMessageTimeOutStop = {};
        $scope.eMessageTabs = {
            ROLE_EMESSAGE: false,
            ROLE_EMESSAGE_CRE: false,
            ROLE_EMESSAGE_OBSM: false,
            ROLE_EMESSAGE_ECC: false,
        };
        $scope.sendAll = false;
        $scope.showFilterError = false;

        $rootScope.eMessageTimeout = true;
        // $(".emessage-chat-panel").bind("DOMSubtreeModified", function() {
        //       $scope.scrollToBottom();
        //  });

        $scope.initFilters = function() {
            $scope.filters = {};
            angular.forEach($scope.options, function(value, key) {
                if (value instanceof Array) {
                    $scope.filters[key] = [];
                    angular.forEach(value, function(value1, key1) {
                        $scope.filters[key].push(value1);
                    });
                } else {
                    $scope.filters[key] = $scope.options[key];
                }
            });
        };


        $scope.openEditMessageObjectiveModal = function(m) {
            $scope.editView = 'message';
            var model = {}
            angular.copy(m, model);
            model.date = model.startDate ? $filter('date')(new Date(model.startDate), 'dd-MM-yyyy') : '';
            model.endDate = model.endDate ? $filter('date')(new Date(model.endDate), 'dd-MM-yyyy') : '';
            $scope.messageObjectivesModal = {
                message: model,
                isPeriodEnabled: !!model.endDate
            };
            $('#messageObjectivesModal').foundation('reveal', 'open');
        };

        $scope.removeMessageObjective = function(objective) {

            if (confirm("Are you sure you want to delete this eMessage?") == true) {
                $scope.disabled = true;
                messageService.remove(objective.id, function() {
                    $scope.disabled = false;
                }, function() {
                    $scope.disabled = false;
                }).run();
                $route.reload();
            }
        };

        $scope.editEmessage = function(modalObject) {
            if ($scope.disabled) {
                return;
            }
            if (!modalObject.isPeriodEnabled) {
                modalObject.message.endDate = null;
            }
            $scope.disabled = true;
            var success = function(data) {
                $scope.disabled = false;
                $scope.cancelEditModal();

                function resolve(data) {
                    $scope.messages = data.reverse();
                    $scope.cancelEditModal();
                }

                function reject(error) {
                    console.log(error);
                }

                messageService.fetchMessagesCancel($scope.options.halfSets, $scope.options.trains, $scope.options.date, $scope.options.isPeriodEnabled ? $scope.options.endDate : null, $scope.role, resolve, reject).run();
            };
            var error = function(error, status) {
                $scope.disabled = false;
                alert('Error');
            };

            messageService.update(modalObject.message.id, modalObject.message.halfSets, modalObject.message.trainNumber, modalObject.message.date, modalObject.message.endDate, modalObject.message.role, modalObject.message.message, modalObject.message.toAll, success, error).run();
        };

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

        $scope.cancelEditModal = function() {
            if ($scope.disabled) {
                return;
            }
            $('#messageObjectivesModal').foundation('reveal', 'close');
        };

        $scope.switchFilterView = function(view) {
            $scope.filterView = view;
        };

        $scope.switchEditView = function(view) {
            $scope.editView = view;
        };

        $scope.removeFilter = function(key, value, isEdit) {
            var field = isEdit ? $scope.messageObjectivesModal.message : $scope.filters;
            if (value === undefined) {
                delete field[key];
            } else {
                // Cross browser
                var newValues = [];
                angular.forEach(field[key], function(v, i) {
                    if (v === value) {
                        return;
                    }
                    newValues.push(v);
                });
                field[key] = newValues;
            }
        };

        $scope.removeSelectedFilter = function(key, value) {
            if (value === undefined) {
                delete $scope.options[key];
            } else {
                // Cross browser
                var newValues = [];
                angular.forEach($scope.options[key], function(v, i) {
                    if (v === value) {
                        return;
                    }
                    newValues.push(v);
                });
                if (newValues.length === 0) {
                    delete $scope.options[key];
                } else {
                    $scope.options[key] = newValues;
                }
            }
            $location.search($scope.options);
        };

        $scope.addFilter = function(key, model, isEdit) {
            if (!$scope[model]) {
                return;
            }
            if (key === 'halfSets' && (isNaN(+$scope[model]) || (+$scope[model] < 0))) {
                return;
            }
            if (key === 'trains' && !isEdit) {
                // $scope.removeFilter('trains', '90*');
                // $scope.removeFilter('trains', '91*');
            }
            if (isEdit) {
                if ($scope.messageObjectivesModal.message[key] === undefined) {
                    $scope.messageObjectivesModal.message[key] = [$scope[model]];
                } else {
                    $scope.messageObjectivesModal.message[key].push($scope[model]);
                    var newValues = [];
                    angular.forEach($scope.messageObjectivesModal.message[key], function(v, i) {
                        newValues.push(v);
                    });
                    $scope.messageObjectivesModal.message[key] = newValues;
                }
            } else {
                if ($scope.filters[key] === undefined) {
                    $scope.filters[key] = [$scope[model]];
                } else {
                    $scope.filters[key].push($scope[model]);
                    var newValues = [];
                    angular.forEach($scope.filters[key], function(v, i) {
                        newValues.push(v);
                    });
                    $scope.filters[key] = newValues;
                }
            }
            delete $scope[model];
        };

        $scope.applyFilters = function() {
            if ($scope.filters.isPeriodEnabled) {
                var dateFrom, dateTo;
                if ($scope.filters.date) {
                    var parts = $scope.filters.date.split("-");
                    dateFrom = Date.parse(new Date(parts[2] + "-" + parts[1] + "-" + parts[0] + "T00:00:00Z"));
                } else {
                    return;
                }
                if ($scope.filters.endDate) {
                    var endDateParts = $scope.filters.endDate.split("-");
                    dateTo = Date.parse(new Date(endDateParts[2] + "-" + endDateParts[1] + "-" + endDateParts[0] + "T00:00:00Z"));
                } else {
                    return;
                }

                if (+dateTo < +dateFrom) {
                    return;
                }
            }

            $scope.options = {};

            angular.forEach($scope.filters, function(value, key) {
                $scope.options[key] = value;
            });
            $scope.showFilters = false;
            $location.search($scope.options);
        };

        $scope.showFilterModal = function() {
            $scope.initFilters();
            $scope.showFilters = true;
        };

        $scope.hideFilterModal = function() {
            $scope.showFilters = false;
        };

        var intervalInit = $interval(function() {
            if ($rootScope.userGroup) {
                $interval.cancel(intervalInit);
                $scope.listMessages();
            }
        }, 1000);

        $scope.listMessages = function() {
            $scope.options = {};
            //$scope.options.trains = $routeParams.trains ? $routeParams.trains : ['90*', '91*']
            if ($routeParams.halfSets != null) {
                if ($routeParams.halfSets instanceof Array) {
                    $scope.options.halfSets = $routeParams.halfSets;
                } else {
                    $scope.options.halfSets = $routeParams.halfSets.split(",");
                }
            }
            if ($routeParams.trains != null) {
                if ($routeParams.trains instanceof Array) {
                    $scope.options.trains = $routeParams.trains;
                } else {
                    $scope.options.trains = $routeParams.trains.split(",");
                }
            } else {
                $scope.options.trains = [];
            }

            switch ($rootScope.userGroup) {
                case 'EUROSTAR':
                    var defaultRole = 'ALL';
                    break;
                case 'MOMENTUM':
                    var defaultRole = 'M_ALL';
                    break;
                default:
                    var defaultRole = 'ALL';
                    break;
            }
            $scope.role = $routeParams.role ? $routeParams.role : defaultRole;
            $scope.filterView = 'date';
            $scope.options.date = $routeParams.date ? $routeParams.date : $filter('date')(new Date(), 'dd-MM-yyyy');
            $scope.options.endDate = $routeParams.endDate ? $routeParams.endDate : $filter('date')(new Date(), 'dd-MM-yyyy');
            $scope.options.isPeriodEnabled = !!$routeParams.isPeriodEnabled;

            var success = function(data) {

                $scope.messages = data.reverse();
                //$scope.scrollToBottom();
                if ($rootScope.eMessageTimeout) {
                    $scope.eMessageTimeOutStop = $timeout(function() {
                        console.log('success');
                        messageService.fetchMessagesCancel($scope.options.halfSets, $scope.options.trains, $scope.options.date, $scope.options.isPeriodEnabled ? $scope.options.endDate : null, $scope.role, success, error).run();
                    }, 10000);
                }
            };
            var error = function(error, status) {
                alert("ERROR");
            };

            messageService.fetchMessagesCancel($scope.options.halfSets, $scope.options.trains, $scope.options.date, $scope.options.isPeriodEnabled ? $scope.options.endDate : null, $scope.role, success, error).run();
            $scope.scrollToBottom();
        };

        $scope.$on('event:http-cancel', function() {
            $scope.options = {};
            //$scope.options.trains = $routeParams.trains ? $routeParams.trains : ['90*', '91*']
            if ($routeParams.trains != null) {
                if ($routeParams.trains instanceof Array) {
                    $scope.options.trains = $routeParams.trains;
                } else {
                    $scope.options.trains = $routeParams.trains.split(",");
                }
            } else {
                $scope.options.trains = [];
            }

            switch ($rootScope.userGroup) {
                case 'EUROSTAR':
                    var defaultRole = 'ALL';
                    break;
                case 'MOMENTUM':
                    var defaultRole = 'M_ALL';
                    break;
                default:
                    var defaultRole = 'ALL';
                    break;
            }
            $scope.role = $routeParams.role ? $routeParams.role : defaultRole;
            $scope.filterView = 'date';
            $scope.options.date = $routeParams.date ? $routeParams.date : $filter('date')(new Date(), 'dd-MM-yyyy');
            $scope.options.endDate = $routeParams.endDate ? $routeParams.endDate : $filter('date')(new Date(), 'dd-MM-yyyy');
            $scope.options.isPeriodEnabled = !!$routeParams.isPeriodEnabled;
            console.log('cancel');
            var success = function(data) {
                $scope.messages = data.reverse();
                if ($rootScope.eMessageTimeout) {
                    console.log('cancel success');
                    $scope.listMessages();
                }
            };
            var error = function(error, status) {
                alert("ERROR");
            };
            messageService.fetchMessagesCancel($scope.options.halfSets, $scope.options.trains, $scope.options.date, $scope.options.isPeriodEnabled ? $scope.options.endDate : null, $scope.role, success, error).run();
        });

        $scope.scrollToBottom = function() {
            $('.emessage-chat-panel').each(function() {
                $(this).scrollTop($(document).height() * 1000);
            });
        };

        $scope.postMessage = function(event) {
            if (event === undefined || ((event.keyCode === 13 || event.keyCode === 10) && event.ctrlKey)) {
                if (!$scope.disabled) {
                    if ($scope.options.trains.length || $scope.options.halfSets) {
                        $scope.showFilterError = false;
                        if (event) event.preventDefault(); // forbid new line when ctrl+enter pressed
                        $scope.disabled = true;
                        var success = function(data) {
                            $scope.message = '';
                            //$location.search({trains:$scope.trains, date:$scope.date, role:$scope.role});
                            /*$route.reload();*/
                            function resolve(data) {
                                $scope.messages = data.reverse();
                                $scope.scrollToBottom();
                                $scope.disabled = false;
                            }

                            function reject(error) {
                                console.log(error);
                                $scope.disabled = false;
                            }

                            messageService.fetchMessagesCancel($scope.options.halfSets, $scope.options.trains, $scope.options.date, $scope.options.isPeriodEnabled ? $scope.options.endDate : null, $scope.role, resolve, reject).run();

                            $scope.scrollToBottom();
                        };
                        var error = function(error, status) {
                            $scope.disabled = false;
                            console.log(error);
                        };

                        var trainDate;
                        if ($scope.options.date) trainDate = $scope.options.date;
                        else trainDate = $filter('date')(new Date(), 'dd-MM-yyyy');

                        var trainEndDate;
                        if ($scope.options.endDate && $scope.options.isPeriodEnabled) trainEndDate = $scope.options.endDate;
                        else trainEndDate = null;

                        var messageText = $scope.message.replace(/\s+$/, "");
                        messageService.postMessage($scope.options.halfSets, $scope.options.trains, trainDate, trainEndDate, $scope.role, messageText, $scope.sendAll, success, error).run();
                    } else {
                        $scope.showFilterError = true;
                    }
                }
            }
        };

        $scope.formatDate = function(date) {
            return $filter('date')(new Date(date), 'dd-MM-yyyy');
        };

        $scope.postFutureMessage = function() {
            var success = function(data) {
                $scope.message = '';
                //$location.search({trains:$scope.trains, date:$scope.date, role:$scope.role});
                /*$route.reload();*/
                $scope.scrollToBottom();
                $scope.cancelModal();
            };
            var error = function(error, status) {
                console.log(error);
            };
            messageService.postFutureMessage($scope.messageModal.message, success, error).run();
        };

        $scope.newEmessage = function() {
            $scope.messageModal = {
                isNewEmessage: true,
                message: {
                    trainNumber: []
                },
                addTrain: function() {
                    var t = $scope.messageModal.trainNumberToAdd;
                    $scope.messageModal.message.trainNumber.push(t);
                },
                removeTrain: function(t) {
                    // Cross browser
                    var newValues = [];
                    angular.forEach($scope.messageModal.message.trainNumber, function(value, i) {
                        if (value === t) {
                            return;
                        }
                        newValues.push(value);
                    });
                    $scope.messageModal.messagetrainNumber = newValues;
                }
            };
            $('#eMessageModal').foundation('reveal', 'open');
        };

        $scope.cancelModal = function() {
            $('#eMessageModal').foundation('reveal', 'close');
        };

        $scope.changeTab = function(tab) {
            $timeout.cancel($scope.eMessageTimeOutStop);
            $location.search({
                halfSets: $scope.options.halfSets || [],
                trains: $scope.options.trains,
                date: $scope.options.date,
                endDate: $scope.options.endDate,
                isPeriodEnabled: $scope.options.isPeriodEnabled,
                role: tab
            });
        };

        $scope.markAsRead = function(message) {
            messageService.markAsRead(message.id, function(data) {
                message.read = true;
            }, function(error) {}).run();
        };

        $scope.onChangeSendAll = function(value) {
            $scope.sendAll = value;
        };

        let loginConfirm = $rootScope.$on('event:auth-loginConfirmed', function() {
            if ($rootScope.user === undefined || $rootScope.user.permissions === undefined) {
                return false;
            }

            angular.forEach($rootScope.user.permissions, function(p) {
                if (p.toUpperCase().indexOf('ROLE_EMESSAGE') > -1) {
                    $scope.eMessageTabs[p.toUpperCase()] = true;
                }
            });

            $(document).foundation('section', 'reflow');

            for (let prop in $scope.eMessageTabs) {
                if ($scope.eMessageTabs[prop] && prop !== 'ROLE_EMESSAGE' && !$routeParams.role) {
                    // should change default role for tabs
                    $scope.role = prop.slice(14); //cut out 'ROLE_EMESSAGE_'
                    $routeParams.role = $scope.role;
                    return;
                }
            }
        });

        $scope.$on('$destroy', function() {
            $timeout.cancel($scope.eMessageTimeOutStop);
            $interval.cancel(intervalInit);
            loginConfirm();
        });

    }
]);