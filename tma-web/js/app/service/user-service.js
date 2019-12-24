angular.module('tmweb').service('UserService', ['$rootScope', 'HttpQueue', function($rootScope, HttpQueue) {
	return {
		findAll: function(success, error, options) {
			if (options === undefined) {
				options = {page: 0, max: 20};
			}
			return HttpQueue.get($rootScope.api + "/users", {params: options}).success(success).error(error);
		},
		findById: function(id, success, error) {
			return HttpQueue.get($rootScope.api + "/users/" + id).success(success).error(error);
		},
		listBaseLocations: function(success, error) {
			return HttpQueue.get($rootScope.api + "/users/locations").success(success).error(error);
		},
		/*  Below is the model from the middleware.
			String id;
			String username;
			String name;
			String email;
			List<String> roles;
			boolean enabled; // do not need to model, it should be handled by controller
			boolean locked; // this we do need
			boolean resetPassword; // this should be handled by the controller.
		*/
		/**
		* Creates a new user account from the specified model.
		*/
		createUser: function(user, success, error) {
			var data = {
				username: user.username,
				name: user.name,
				email: user.email,
				roles: user.roles,
				baseLocation: user.baseLocation
			};
			return HttpQueue.post($rootScope.api + "/users", data).success(success).error(error);
		},
		/**
		* Updates a user account from a model.
		*/
		updateUser: function(user, success, error) {
			var data = {
				username: user.username,
        id: user.id,
				name: user.name,
				email: user.email,
				roles: user.roles,
				baseLocation: user.baseLocation
			}
			return HttpQueue.put($rootScope.api + "/users", data).success(success).error(error);
		},
		generateNewPassword: function(user, success, error) {
			return HttpQueue.put($rootScope.api + "/users/reset/" + user.id).success(success).error(error);
		},
		disableUser: function(user, success, error) {
			return HttpQueue.put($rootScope.api + "/users/disable/" + user.id).success(success).error(error);
		},
		enableUser: function(user, success, error) {
			return HttpQueue.put($rootScope.api + "/users/enable/" + user.id).success(success).error(error);
		}
	}
}]);
