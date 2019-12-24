angular.module('tmweb').controller('RoleController', ['$scope', '$translate', 'RoleService', function($scope, $translate, roleService) {
	// Setup Model
	roleService.listAuthorities(function(data) {
		$scope.authorities = data;
	}, function(err) {
		//$scope.isGenericError = true;
		alert("FIXME: Create error handler");
	}).run();
	
	// Action Methods
	$scope.list = function() {
		// Return the promise
		return roleService.findAll(function(data) {
			$scope.roles = data;
		}, function(error) {
			alert("FIXME: Create error handler");
		});
	}
	
	$scope.cancelModal = function() {
		$scope.roleModal.role = {}
		$scope.roleModal.authorities = []
		$scope.roleModal.errors = []
		$scope.isValidationError = false;
		$scope.isGenericError = false;
		$('#roleModal').foundation('reveal', 'close');
	}
	
	$scope.removeRole = function(role) {
		if (confirm($translate('admin.roles.table.delete.confirm') + role.id) == true) {
			roleService.removeRole(role,function() {
				$scope.roleRemoved = role.id;
				$scope.roleAdded = false;
				$scope.roleEdited = false;
			}, function() {
				$scope.roleRemoved = false;
				$scope.roleAdded = false;
				$scope.roleEdited = false;
				$scope.genericError = true;
			}).run();
			$scope.list().run();
		}
	}
	
	$scope.saveRole = function() {
		// Shortcuts
		var authorities = $scope.roleModal.authorities;
		var role = $scope.roleModal.role;
		
		// Resets
		$scope.roleModal.errors = [];
		$scope.isValidationError = false;
		$scope.isGenericError = false;
		$scope.roleRemoved = false;
		$scope.roleAdded = false;
		$scope.roleUpdated = false;
		// setup authorities for role.
		angular.forEach(authorities, function(a, i) {
			var index = role.authorities.indexOf(a.name);
			if (a.checked && index == -1) {
				role.authorities.push(a.name);
			} else if (!a.checked && index > -1) {
				role.authorities.splice(index, 1);
			}
		});
		// Make sure the modal is closed and the user saved.
		var success = function(data) {
			$scope.isValidationError = false;
			$scope.isGenericError = false;
			if ($scope.roleModal.isNewRole) {
				$scope.roleAdded = role.id;
				delete $scope.roleEdited;
				$scope.list().run();
			} else {
				$scope.roleEdited = role.id;
				delete $scope.roleAdded;
				$scope.list().run();
			}
			$scope.roleModal.role = { authorities: []};
			$scope.roleModal.authorities = [];
			$scope.roleModal.errors = [];
			$scope.isValidationError = false;
			$scope.isGenericError = false;
			$('#roleModal').foundation('reveal', 'close');
		};
		// What do you do when an error occurs. It's either validation or 500...
		var error = function(err, status) {
			if (status == 400 && (typeof err.fieldErrors != 'undefined')) {
				// FIXME: This needs to be a utility method, but I am not worried too much right now
				// we still need to provide translation, in the form of a json file.
				$scope.isValidationError = true;
				$scope.isGenericError = false;
				angular.forEach(err.fieldErrors, function(e, i) {
					$scope.roleModal.errors[e.path] = e.message;
				});
			} else {
				// FIXME: Make sure we handle this properly using a dialog and error scope.
				$scope.isValidationError = false;
				$scope.isGenericError = true;
			}
		}
		// Save the role
		if ($scope.roleModal.isNewRole) {
			roleService.createRole(role, success, error).run(); // execute straight away as there are no other requests...
		} else {
			roleService.updateRole(role, success, error).run(); // execute straight away as there are no other requests...
		}
	}
	
	$scope.newRole = function() {
		$scope.roleModal = {
			isNewRole: true,
			role: {
				id: '',
				authorities: []
			},
			authorities: [],
			errors:[]
		}
		angular.forEach($scope.authorities, function(a, i) {
			$scope.roleModal.authorities.push({checked:false, name:a});
		});
		$('#roleModal').foundation('reveal', 'open');
	}
	
	$scope.editRole = function(role) {
		$scope.roleModal = {
			isNewRole: false,
			role: role,
			authorities: [],
			errors:[]
		}
		angular.forEach($scope.authorities, function(a, i) {
			$scope.roleModal.authorities.push({
				checked:(role.authorities.indexOf(a) > -1), 
				name:a
			});
		});
		$('#roleModal').foundation('reveal', 'open');
	}	
}]);