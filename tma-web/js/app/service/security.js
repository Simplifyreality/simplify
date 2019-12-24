(function() {
	angular.module('tmweb-security', ['http-auth-interceptor-buffer', 'http-queue', 'ngCookies']).factory('authService', function($rootScope, $cookieStore, $location, httpBuffer, HttpQueue) {
		// By default one is not logged in.
		$rootScope.loggedIn = false;

		return {
			checkPermission: function(object) {
				// TODO
			},
			isLoggedIn: function(configUpdater) {
				if ($location.path() == $rootScope.logoutView) {
					return;
				}
				if ($location.path() == $rootScope.resetPasswordView) {
					return;
				}
				if ($location.path() == '/error') {
					return;
				}
				var updater = configUpdater || function(config) {
						return config;
					};

				HttpQueue.getAtFront($rootScope.loginUrl).success(function(data) {
					if (data.loggedIn) {
						$rootScope.$broadcast('event:auth-loginConfirmed', data);
						//httpBuffer.retryAll(updater);
					} else if (data.resetPassword) {
						$rootScope.$broadcast('event:auth-loginResetPassword', data);
					} else {
						$rootScope.$broadcast('event:auth-loginRequired', data);
					}
				}).error(function(err) {
					// By default we are not logged in if there is an error
					$rootScope.$broadcast('event:auth-loginRequired');
				});
			},
			login: function(username, password) {
				// Login action. Sends a JSON post 
				HttpQueue.post($rootScope.loginUrl, {
					"username": username,
					"password": password,
					"version":  $rootScope.V ? $rootScope.V : "X"
				}).success(function(data) {
					if (data.loggedIn) {
						$rootScope.$broadcast('event:auth-loginSuccess', data);
					} else if (data.resetPassword) {
						$rootScope.$broadcast('event:auth-loginResetPassword', data);
					} else {
						$rootScope.$broadcast('event:auth-loginFailed', data);
					}
				}).run(); // We want to run these "now"
			},
			resetPassword: function(username, oldPassword, newPassword, confirmPassword, error) {
				HttpQueue.post($rootScope.resetPasswordUrl, {
					"username": username,
					"oldPassword": oldPassword,
					"newPassword": newPassword,
					"confirmPassword": confirmPassword
				}).success(function(data) {
					if (data.loggedIn) {
						$rootScope.$broadcast('event:auth-loginSuccess', data);
					} else if (data.resetPassword) {
						$rootScope.$broadcast('event:auth-loginResetPassword', data);
					} else {
						$rootScope.$broadcast('event:auth-loginFailed', data);
					}
				}).error(error).run(); // We want to run these "now"
			},
			logout: function() {
				HttpQueue.post($rootScope.logoutUrl).success(function(data, status) {
					$rootScope.$broadcast('event:auth-loggedOut', data);
				}).run(); // We want to run these "now"
			},
			hasPermission: function(user, permission) {
					var permissionName = "ROLE_" + permission.toUpperCase();
					return $.inArray(permissionName, user.permissions) > -1;
			}
		}
	})

	/**
	 * @license HTTP Auth Interceptor Module for AngularJS
	 * (c) 2012 Witold Szczerba
	 * License: MIT
	 */

	/**
	 * $http interceptor.
	 * On 401 response (without 'ignoreAuthModule' option) stores the request
	 * and broadcasts 'event:angular-auth-loginRequired'.
	 */
	.config(['$httpProvider',
		function($httpProvider) {
			var queue = [];
			var interceptor = ['$rootScope', '$q', 'httpBuffer',
				function($rootScope, $q, httpBuffer) {
					function success(response) {
						return response;
					}

					function error(response) {
						if (response.status === 401 && !response.config.ignoreAuthModule) {
							var deferred = $q.defer();
							httpBuffer.append(response.config, deferred);
							$rootScope.$broadcast('event:auth-loginRequired');
							return deferred.promise;
						}
						// otherwise, default behaviour
						return $q.reject(response);
					}

					return function(promise) {
						return promise.then(success, error);
					};

				}
			];
			$httpProvider.responseInterceptors.push(interceptor);
		}
	]);

	/**
	 * Private module, a utility, required internally by 'http-auth-interceptor'.
	 */
	angular.module('http-auth-interceptor-buffer', [])

	.factory('httpBuffer', ['$injector',
		function($injector) {
			/** Holds all the requests, so they can be re-requested in future. */
			var buffer = [];

			/** Service initialized later because of circular dependency problem. */
			var $http;

			function retryHttpRequest(config, deferred) {
				function successCallback(response) {
					deferred.resolve(response);
				}

				function errorCallback(response) {
					deferred.reject(response);
				}
				$http = $http || $injector.get('$http');
				$http(config).then(successCallback, errorCallback);
			}

			return {
				/**
				 * Appends HTTP request configuration object with deferred response attached to buffer.
				 */
				append: function(config, deferred) {
					buffer.push({
						config: config,
						deferred: deferred
					});
				},

				/**
				 * Retries all the buffered requests clears the buffer.
				 */
				retryAll: function(updater) {
					for (var i = 0; i < buffer.length; ++i) {
						retryHttpRequest(updater(buffer[i].config), buffer[i].deferred);
					}
					buffer = [];
				}
			};
		}
	]);
})();
