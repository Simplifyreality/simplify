angular.module('tmweb').service('RoleService', ['$rootScope', 'HttpQueue', function($rootScope, HttpQueue) {
	return {
		listAuthorities: function(success, error) {
			return HttpQueue.get($rootScope.api + "/roles/authorities").success(success).error(error);
		},
		listRoleIds: function(success, error) {
			return HttpQueue.get($rootScope.api + "/roles/list-ids").success(success).error(error);
		},
		findAll: function(success, error, options) {
			if (options === undefined) {
				options = {page: 0, max: 999};
			}
			return HttpQueue.get($rootScope.api + "/roles", {params: options}).success(success).error(error);
		},
		createRole: function(role, success, error) {
			return HttpQueue.post($rootScope.api + "/roles", {id: role.id, authorities: role.authorities}).success(success).error(error);
		},
		updateRole: function(role, success, error) {
			return HttpQueue.put($rootScope.api + "/roles/" + role.id, {id: role.id, authorities: role.authorities}).success(success).error(error);
		},
		removeRole: function(role, success, error) {
			return HttpQueue['delete']($rootScope.api + "/roles/" + role.id).success(success).error(error);
		}
	}
}]);
