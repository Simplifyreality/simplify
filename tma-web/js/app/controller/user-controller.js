angular.module('tmweb').controller('UserController', ['$scope', '$routeParams', '$translate', '$location', 'UserService', 'AnnouncementService', 'RoleService', function($scope, $routeParams, $translate, $location, userService, announcementService, roleService) {
	// Setup model
	roleService.listRoleIds(function(data) {
		// FIXME: We might need to deal with pagination here... Although I think we might want to remove that...
		$scope.roles = data;
	}, function(err) {
		
	});
	
	userService.listBaseLocations(function(data) {
		$scope.baseLocations = [{value:'-1', name:$translate('admin.users.model.baseLocation.placeholder'), disabled:true}];
		angular.forEach(data, function(value, d) {
			$scope.baseLocations.push({value: value, name:value})
		});
	}, function(err) {
		
	});

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
	}

	// Action methods
	$scope.list = function() {
		$scope.options = {
			size:10
		};
		if ($routeParams.page === undefined || $routeParams.page < 0) {
			$scope.options.page = 0;
		} else {
			$scope.options.page = $routeParams.page;
		}
		return userService.findAll(function(data) {
			$scope.users = data;
		}, function() {
			$scope.isValidationError = false;
			$scope.isGenericError = true;
			$scope.userDisabled = false;
			$scope.userAdded = false;
			$scope.userUpdated = false;
		}, $scope.options);
	};

	$scope.changePage = function(page) {
		if (page < 0) {
			page = 0;
		}
		if ($scope.options === undefined) {
			$scope.options = { size:10, page: page};
		} else {
			$scope.options.page = page;
		}
		$location.search($scope.options);
	}


	$scope.saveUser = function() {
		var roles = $scope.userModal.roles;
		var user = $scope.userModal.user;
		
		// Setup roles
		angular.forEach(roles, function(role, r) {
			var index = user.roles.indexOf(roles[r].name);
			if (role.checked && index == -1) {
				user.roles.push(role.name);
			} else if (!role.checked && index > -1) {
				user.roles.splice(index, 1);
			}
		});
		
		// Check base location
		if (user.baseLocation == "-1") {
			user.baseLocation = null; // set to null, we will validate on the server
		}
		
		var success = function(data) {
			$scope.isValidationError = false;
			$scope.isGenericError = false;
			// If it is a new user being created, then display a new user message
			if ($scope.userModal.isNewUser) {
				$scope.userAdded = user.name;
				delete $scope.userEdited;
				$scope.list().run();
			// Otherwise displayed that the user was updated
			} else {
				$scope.userEdited = user.name;
				delete $scope.userAdded;
				$scope.list().run();
			}
			// Reset everything
			$scope.userModal.user = { roles: []};
			$scope.userModal.roles = [];
			$scope.userModal.errors = [];
			$('#userModal').foundation('reveal', 'close');
		};
		
		var error = function(err, status) {
			if (status == 400 && (typeof err.fieldErrors != 'undefined')) {
				// FIXME: This needs to be a utility method, but I am not worried too much right now
				// we still need to provide translation, in the form of a json file.
				$scope.isValidationError = true;
				$scope.isGenericError = false;
				$scope.userModal.errors = [];
				angular.forEach(err.fieldErrors, function(e, i) {
					$scope.userModal.errors[e.path] = e.message;
				});
				if ($scope.userModal.user.baseLocation == null) {
					$scope.userModal.user.baseLocation = "-1";
				}
			} else {
				// FIXME: Make sure we handle this properly using a dialog and error scope.
				$scope.isValidationError = false;
				$scope.isGenericError = true;
			}
		};
		
		// Save the user
		if ($scope.userModal.isNewUser) {
			userService.createUser(user, success, error).run(); // execute straight away as there are no other requests...
		} else {
			userService.updateUser(user, success, error).run(); // execute straight away as there are no other requests...
		}
	}
	$scope.cancelModal = function() {
		$('#userModal').foundation('reveal', 'close');
		$scope.view = 'details';
	}
	$scope.generateNewPassword = function(user) {
		if (confirm($translate('admin.users.table.reset.confirm') + user.name) == true) {
			userService.generateNewPassword(user, function(data) {
				$scope.passwordReset = user.name;
				$scope.list().run();
			}, function(error) {
				$scope.resetErrors();
				$scope.isGenericError = true;
			}).run();
		}
	}
	$scope.disable = function(user) {
		if (confirm($translate('admin.users.table.disable.confirm') + user.name) == true) {
			$scope.resetErrors();
			userService.disableUser(user,function() {
				$scope.userDisabled = user.name;
			}, function() {
				$scope.genericError = true;
			}).run();
			$scope.list().run();
		}
	}
	$scope.enable = function(user) {
		if (confirm($translate('admin.users.table.enable.confirm') + user.name) == true) {
			$scope.resetErrors();
			userService.enableUser(user,function() {
				$scope.userEnabled = user.name;
			}, function() {
				$scope.genericError = true;
			}).run();
			$scope.list().run();
		}
	}
	// Create a new user
	$scope.newUser = function() {
		$scope.userModal = {
			isNewUser:true,
			user: {baseLocation:"-1", roles:[]},
			view: 'details',
			roles:[],
		};
		// Reset the errors
		$scope.resetErrors();
		
		// Setup role selection
		angular.forEach($scope.roles, function(role, r) {
			$scope.userModal.roles.push({checked:false, name:role});
		});
		// Open Modal
		$('#userModal').foundation('reveal', 'open');
	};
	// Update an existing userd
	$scope.editUser = function(user) {
		var model = {}
		angular.copy(user, model);
		$scope.userModal = {
			isNewUser:false,
			user: model,
			view: 'details',
			roles: [],
			announcements: []
		}
		// Reset the errors
		$scope.resetErrors();
		
		// Setup roles
		angular.forEach($scope.roles, function(role, r) {
			$scope.userModal.roles.push({checked:(user.roles.indexOf(role) > -1), name:role});
		});
		// Open Modal
		announcementService.listPersonalAnnouncements(user.id, function(data) {
			$scope.userModal.announcements = [];
			angular.forEach(data, function(d, i) {
				var announcement = {
					script: []
				};
				angular.forEach(d.script, function(s, j) {
					announcement.script.push({language:j, title:s.title, script:s.script});
				});
				$scope.userModal.announcements.push(announcement);
			});
			$('#userModal').foundation('reveal', 'open');
		}, function(error) {
			alert("There was an error getting personal announcements");
		}).run();
	};
	
	$scope.resetErrors = function() {
		if ($scope.userModal != undefined) {
			$scope.userModal.errors = [];
		}
		$scope.isValidationError = false;
		$scope.isGenericError = false;
		$scope.userDisabled = false;
		$scope.userEnabled = false;
		$scope.userAdded = false;
		$scope.userUpdated = false;
		$scope.passwordReset = false;
	};
	
	$scope.resetErrors();
}]);