(function() {
    'use strict';

    angular.module('tmweb', [
            'ngCookies',
            'ngRoute',
            'tmweb-security',
            'http-queue',
            'spin.js',
            'pascalprecht.translate',
            'xeditable',
            'windowEventBroadcasts',
            'tmweb.config',
            'checklist-model'
        ])
        .config(['$routeProvider', function($routeProvider) {

            // Setup router
            $routeProvider.when('/', {
                controller: 'HomeController',
                templateUrl: 'views/home.html'
            }).when('/journeys', {
                controller: 'JourneyLogsController',
                templateUrl: 'views/journeys.html'
            }).when('/journeys-momentum', {
                controller: 'JourneyLogsMomentumController',
                templateUrl: 'views/journeys-momentum.html'
            }).when('/journeys/tickets', {
                controller: 'TicketsController',
                templateUrl: 'views/tickets.html'
            }).when('/boarding', {
                controller: 'MealController',
                templateUrl: 'views/meal.html'
            }).when('/boarding/:boardingId', {
                controller: 'MealDetailsController',
                templateUrl: 'views/meal-details.html'
            }).when('/cleaning', {
                controller: 'CleaningController',
                templateUrl: 'views/cleaning.html'
            }).when('/view-cleaning/:id', {
                controller: 'ViewCleaningController',
                templateUrl: 'views/cleaning-detail.html'
            }).when('/view-journey/:id', {
                controller: 'ViewJourneyController',
                templateUrl: 'views/journeys-tabs.html'
            }).when('/view-journey-momentum/:id', {
                controller: 'ViewJourneyMomentumController',
                templateUrl: 'views/journeys-tabs-momentum.html'
            }).when('/issues', {
                controller: 'IssuesController',
                templateUrl: 'views/issues.html'
            }).when('/issues/:id', {
                controller: 'ViewIssueController',
                templateUrl: 'views/issues-detail.html'
            }).when('/specials', {
                controller: 'SpecialsController',
                templateUrl: 'views/specials.html'
            }).when('/train-objectives', {
                controller: 'TrainObjectivesController',
                templateUrl: 'views/train-objectives.html'
            }).when('/fault-history', {
                controller: 'FaultHistoryController',
                templateUrl: 'views/faults.html'
            }).when("/fault-history/:id", {
                controller: "ViewFaultController",
                templateUrl: "views/faults-detail.html"
            }).when('/emessage', {
                controller: 'EMessageController',
                templateUrl: 'views/emessages.html'
            }).when('/admin', {
                redirectTo: '/admin/users'
            }).when('/admin/users', {
                controller: 'UserController',
                templateUrl: 'views/users.html'
            }).when('/admin/roles', {
                controller: 'RoleController',
                templateUrl: 'views/roles.html'
            }).when('/login', {
                controller: 'LoginController',
                templateUrl: 'views/login.html'
            }).when('/logout', {
                controller: 'LogoutController',
                templateUrl: 'views/login.html'
            }).when('/reset-password', {
                controller: 'ResetPasswordController',
                templateUrl: 'views/reset-password.html'
            }).when('/admin/issues-category-management', {
                controller: 'IssuesCategoryManagementController',
                templateUrl: 'views/issues-category-management.html'
            }).when('/admin/announcements', {
                controller: 'AnnouncementsController',
                templateUrl: 'views/announcements.html'
            }).when('/admin/addresses', {
                controller: 'AddressManagementController',
                templateUrl: 'views/address-management.html'
            }).when('/error', {
                controller: 'ErrorController',
                templateUrl: 'views/generic-error.html'
            }).when('/not-authorised', {
                controller: 'NotAuthorisedController',
                templateUrl: 'views/error-not-authorised.html'
            }).when('/admin/momentum-names', {
                controller: 'MomentumStaffController',
                templateUrl: 'views/momentum.html'
            }).otherwise({
                redirectTo: '/'
            });
            // Trap login events... <- basically more configuration
        }]).config(['$translateProvider', function($translateProvider) {
            // Setup translation files
            $translateProvider.translations('en', tma_labels_en);
            $translateProvider.preferredLanguage('en');
            $translateProvider.fallbackLanguage('en');
        }]).config(['$provide', function($provide) {
            // Set GMT timezone globally
            $provide.decorator('dateFilter', ['$delegate', function($delegate) {
                var srcFilter = $delegate;
                var isTimestamp = function(x) {
                    return Math.floor(x) === x && x.toString().length === 13;
                };
                var extendsFilter = function() {
                    if (arguments[0] && isTimestamp(arguments[0])) {
                        var date = new Date(arguments[0]);
                        if (date.getTime() > 0) {
                            arguments[0] = date.valueOf() + date.getTimezoneOffset() * 60000;
                        }
                    }

                    return srcFilter.apply(this, arguments);
                };

                return extendsFilter;
            }])
        }]).run(['$rootScope', '$cookies', '$location', '$timeout', 'authService', 'HttpQueue', 'MessageService', 'AppService', '$filter', '$interval', '$window', 'API_ENDPOINT', 'SESSION_COOKIE_KEY', 'NM_ALERTS', 'NM_ALERTS_LOG', 'NM_ALERTS_INTERVAL', 'NM_ALERTS_ROLES', 'ENV',
            function($rootScope, $cookies, $location, $timeout, authService, HttpQueue, messageService, appService, $filter, $interval, $window, API_ENDPOINT, SESSION_COOKIE_KEY, NM_ALERTS, NM_ALERTS_LOG, NM_ALERTS_INTERVAL, NM_ALERTS_ROLES, ENV) {

                $(document).foundation();
                $rootScope.$on('$viewContentLoaded', function() {
                    // Angular - Foundation hacks
                    $('.top-bar').removeClass('expanded');
                    //$(document).foundation({topbar : {custom_back_text: false }});
                    $(document).foundation();
                    $('*[data-date-format]').fdatepicker();
                    $('.reveal-modal').on('opened', function() {
                        $(document).foundation('section', 'reflow');
                    });

                    $rootScope.getLocalVersion();
                });
                $rootScope.api = API_ENDPOINT;
                $rootScope.loginUrl = $rootScope.api + "/login";
                $rootScope.logoutUrl = $rootScope.api + "/logout";
                $rootScope.resetPasswordUrl = $rootScope.api + "/login/reset-password";
                $rootScope.resetPasswordView = "/reset-password";
                $rootScope.logoutView = "/logout";
                $rootScope.sessionCookieKey = SESSION_COOKIE_KEY;
                $rootScope.spinConfig = {
                    lines: 13, // The number of lines to draw
                    length: 20, // The length of each line
                    width: 10, // The line thickness
                    radius: 30, // The radius of the inner circle
                    corners: 1, // Corner roundness (0..1)
                    rotate: 0, // The rotation offset
                    direction: 1, // 1: clockwise, -1: counterclockwise
                    color: '#000', // #rgb or #rrggbb or array of colors
                    speed: 1, // Rounds per second
                    trail: 60, // Afterglow percentage
                    shadow: false, // Whether to render a shadow
                    hwaccel: false, // Whether to use hardware acceleration
                    className: 'spinner', // The CSS class to assign to the spinner
                    zIndex: 2e9, // The z-index (defaults to 2000000000)
                    top: 'auto', // Top position relative to parent in px
                    left: 'auto' // Left position relative to parent in px
                };
                $rootScope.iTMVersion = null;

                $rootScope.ENV = ENV;

                $rootScope.windowFocused = true;

                $rootScope.$on("$routeChangeStart", function(event, next, current) {
                    $rootScope.eMessageTimeout = false;
                    authService.isLoggedIn(next.access); // check that we are logged in... We should have a permission check here...
                    $rootScope.currentView = $location.path();
                    $rootScope.windowFocused = Math.random();
                    //$(document).foundation();
                });
                $rootScope.$on("$viewContentLoaded", function(event, next, current) {
                    HttpQueue.run();
                    //$(document).foundation();
                });
                // Watch for login required event
                $rootScope.$on('event:auth-loginRequired', function(event, next, current) {
                    $rootScope.loggedIn = false;
                    $location.path('/login');
                });
                // Watch for login success event
                $rootScope.$on('event:auth-loginConfirmed', function(event, next, current) {
                    $rootScope.username = next.username;
                    $rootScope.userGroup = next.group;
                    $rootScope.loggedIn = true;
                    $rootScope.user = next;
                    if ($rootScope.userGroup == 'EUROSTAR') {
                        $rootScope.isGroup = 'eurostar_hide';
                    } else {
                        $rootScope.isGroup = 'monument_hide';
                    }

                    if (!$rootScope.iTMVersion) {
                        $rootScope.getVersion();
                    }
                });
                // Watch for logout event
                $rootScope.$on('event:auth-loggedOut', function(event, next, current) {
                    $rootScope.loggedIn = false;
                    $rootScope.user = undefined;
                    $rootScope.iTMVersion = null;
                    $location.path('/login');
                });
                $rootScope.$on('event:auth-loginFailed', function(event, next, current) {
                    $rootScope.loggedIn = false;
                    $rootScope.loginError = true;
                    $location.path('/login');
                });
                $rootScope.$on('event:auth-loginResetPassword', function(event, next, current) {
                    $cookies.EXPIRED_USER = next.username
                    $location.path('/reset-password');
                });
                $rootScope.$on('event:http-queue-not-authorised', function(event, next, current) {
                    console.log("Not authorised");
                    $location.path('/not-authorised');
                });
                $rootScope.$on('event:http-queue-fatal-error', function(event, next, current) {
                    console.log("fatal error");
                    $location.path('/error');
                });
                // Watch for login event
                $rootScope.$on('event:auth-loginSuccess', function(event, next, current) {
                    $rootScope.loggedIn = true;
                    $location.path('/'); // FIXME: We should remember what we are doing here...
                });

                $rootScope.$on('event:http-queue-run', function(event, next, current) {
                    $rootScope.spinif = true;
                });

                $rootScope.$on('event:http-queue-complete', function(event, next, current) {
                    $rootScope.spinif = false;
                });

                $("select").bind("DOMSubtreeModified", function() {
                    Foundation.libs.forms.refresh_custom_select($("select"), true);
                });

                // interval

                $rootScope.unreadMessagesPopupOpened = false;
                $rootScope.intervalInit = false;
                $rootScope.messagesAlertsInterval = null;

                var listener = {
                    disableAlertsFor: ['/emessage'],
                    interval: NM_ALERTS_INTERVAL,
                    logs: NM_ALERTS_LOG,
                    roles: NM_ALERTS_ROLES
                };

                listener.success = function(data) {
                    var unreadMessages = $.grep(data.reverse(), function(message) {
                        return ( /*message.urgent == true && */ message.notified == false && message.read == false);
                    });

                    if (unreadMessages.length && !$rootScope.unreadMessagesPopupOpened) {
                        $rootScope.unreadMessagesPopupOpened = true;

                        if (!$rootScope.windowFocused) {
                            listener.log('window was blurred, so...');
                        }

                        var message = unreadMessages[0];

                        message.message = message.message + '\n\nBy clicking OK you will confirm acknowledgement';

                        if (message && $window.confirm(message.message)) {
                            $rootScope.unreadMessagesPopupOpened = false;

                            $('.reveal-modal').foundation('reveal', 'close'); // close all modals

                            messageService.markAsRead(message.id, function(data) {
                                message.read = true;
                            }, function(error) {}).run();
                        } else {
                            $rootScope.unreadMessagesPopupOpened = false;
                        }
                    }
                };
                listener.error = function(error, status) {
                    listener.log('fetching error');
                };
                listener.run = function() {
                    for (var i in listener.roles) {
                        if (authService.hasPermission($rootScope.user, listener.roles[i] == 'ALL' ? 'NOTIFICATION_MESSAGES' : 'NOTIFICATION_MESSAGES_' + listener.roles[i]) && NM_ALERTS) {
                            messageService.fetchMessagesCancel([], [], $filter('date')(new Date(), 'dd-MM-yyyy'), null, listener.roles[i], listener.success, listener.error).run();
                        }
                    }
                };
                listener.log = function(message) {
                    if (!listener.logs)
                        return;

                    arguments[1] ? console.info("ALERTS:", message) : console.log("ALERTS:", message);
                };

                var startInterval = function() {
                        if ($rootScope.messagesAlertsInterval)
                            return true;

                        setTimeout(function() {
                            if (!$rootScope.loggedIn || !$rootScope.user || !$rootScope.intervalInit) {
                                stopInterval();
                                return false;
                            }
                            stopInterval();

                            listener.log('alerts on');
                            $rootScope.messagesAlertsInterval = $interval(listener.run, listener.interval);
                        }, 1500); /* timeout needed to set user object */
                    },
                    stopInterval = function() {
                        if ($rootScope.messagesAlertsInterval) {
                            if (!$interval.cancel($rootScope.messagesAlertsInterval)) {
                                return false;
                            } else {
                                listener.log('stopped');
                                $rootScope.messagesAlertsInterval = null;
                            }
                        }
                        return true;
                    };

                $rootScope.$watch('windowFocused', function(focused, prev) {
                    if (focused && $.inArray($location.path(), listener.disableAlertsFor) > -1) {
                        stopInterval();
                    } else {
                        startInterval();
                    }
                });

                $rootScope.$watch('unreadMessagesPopupOpened', function(opened, prev) {
                    if (opened) {
                        stopInterval();
                    } else {
                        $rootScope.windowFocused = Math.random();
                    }
                });

                $rootScope.$watch('loggedIn', function(loggedIn, prevLoggedIn) {
                    if (!loggedIn) {
                        if (prevLoggedIn) {
                            listener.log("stopped because you logged out");
                        }
                        stopInterval();
                    } else {
                        $rootScope.intervalInit = Math.random();
                        $rootScope.windowFocused = Math.random();
                    }
                });

                $rootScope.$on('$windowFocus', function(broadcastEvent, browserEvent) {
                    $rootScope.windowFocused = Math.random();
                });
                $rootScope.$on('$windowBlur', function(broadcastEvent, browserEvent) {
                    $rootScope.windowFocused = false;
                });

                $rootScope.getVersion = function() {
                    appService.getVersion(function(data) {
                        $rootScope.iTMVersion = data.value;
                    }, function(error, code) {
                        console.log(error);
                    }).run();
                };

                $rootScope.getLocalVersion = function() {
                    appService.getWebVersion(function(data) {
                        $rootScope.V = data;
                    }, function(error, code) {
                        console.log(error);
                    }).run();
                };

                window.onbeforeunload = function() {
                    authService.logout();
                };

            }
        ]);
})();