(function() {
	/* This http queue will solve the problem of authentication */
	angular.module('http-queue', []).factory('HttpQueue', function($q, $http, $rootScope) {
		$rootScope.httpQueue = [];
		// Queue Processor
		var execNext = function() {
			if ($rootScope.httpQueue.length == 0) {
				// Boardcast that we are starting an ajax request.
				$rootScope.$broadcast("event:http-queue-complete");
				return;
			}
			var task = $rootScope.httpQueue.shift();
			$http(task.c).then(function(data, status, headers) {
				// $rootScope.httpQueue.shift();
				task.d.resolve(data, status, headers, task.c);
				// Once the task is resolved, move on to the next element.
				execNext();
			}, function(err, status, headers, config) {
				// $rootScope.httpQueue.shift();
				task.d.reject(err, status, headers, task.c);
				// Once the task is resolved, move on to the next element.
				execNext();
			});
		};
		// Modify the promise object so that it acts like $http
		var setupPromise = function(promise) {
			promise.success = function(fn) {
				promise.then(function(response) {
					fn(response.data, response.status, response.headers);
				});
				return promise;
			};
			promise.error = function(fn) {
				promise.then(null, function(response) {
					// if (response.status == 500) {
					// 	$rootScope.$broadcast("event:http-queue-fatal-error");
					// 	$rootScope.httpQueue = []; // empty the queue on a 500 error...
					// 	return;
					// } else if (response.status == 403) {
					// 	$rootScope.$broadcast("event:http-queue-not-authorised");
					// 	$rootScope.httpQueue = []; // empty the queue on a 403 error...
					// 	return;
					// }
					switch (response.status) {
						case 0: {
							if(response.config.params.trainNumber && response.config.params.trainNumber.length > 0) {
								$rootScope.$broadcast("event:http-cancel");
							}
							else {
								console.log('no train number');
							}
							$rootScope.httpQueue = [];
							return;
						}
						case 403: {
							$rootScope.$broadcast("event:http-queue-not-authorised");
							$rootScope.httpQueue = [];
							return;
						}
						// validation error
						case 400: {
							console.log(response.data);
							fn(response.data, response.status, response.headers);
							return;
						}
						default: {
							console.log(response.data, 'default');
							$rootScope.$broadcast("event:http-queue-fatal-error");
							$rootScope.httpQueue = []; // empty the queue on an error...
							return;
						}
					}
				});
				return promise;
			};
			promise.run = function() {
				execNext(); // don't return anything we want a void.
			};
			return promise;
		};
		// Return the service methods.
		return {
			// FIXME: We need to make the short cut methods dynamic.
			get: function(url, config) {
				if (config === undefined) {
					config = {};
				}
				config.method = "GET";
				config.url = url;
				config.withCredentials = true;
				return this.queue(config);
			},
			getWithCancel: function(url, config) {
				if (config === undefined) {
					config = {};
				}
				config.method = "GET";
				config.url = url;
				config.timeout = 10000;
				config.withCredentials = true;
				return this.queue(config);
			},
			getAtFront: function(url, config) {
				if (config === undefined) {
					config = {};
				}
				config.method = "GET";
				config.url = url;
				config.withCredentials = true;
				return this.queueAtFront(config);
			},
			post: function(url, data, config) {
				if (config === undefined) {
					config = {};
				}
				config.method = "POST";
				config.url = url;
				config.data = data;
				config.withCredentials = true;
				return this.queue(config);
			},
			put: function(url, data, config) {
				if (config === undefined) {
					config = {};
				}
				config.method = "PUT";
				config.url = url;
				config.data = data;
				config.withCredentials = true;
				return this.queue(config);
			},
			'delete': function(url, data, config) {
				if (config === undefined) {
					config = {};
				}
				config.method = "DELETE";
				config.url = url;
				config.data = data;
				config.withCredentials = true;
				return this.queue(config);
			},
			queue: function(config) {
				var d = $q.defer();
				$rootScope.httpQueue.push({
					c: config,
					d: d
				});
				return setupPromise(d.promise);
			},
			queueAtFront: function(config) {
				var d = $q.defer();
				$rootScope.httpQueue.unshift({
					c: config,
					d: d
				});
				return setupPromise(d.promise);
			},
			run: function() {
				// Boardcast that we are starting an ajax request.
				$rootScope.$broadcast("event:http-queue-run");
				execNext();
			}
		}
	});
})();
