(function () {
    angular.module('tmweb').service({
        UserService: function ($rootScope, HttpQueue) {
            return {
                findAll: function (success, error, options) {
                    if (options === undefined) {
                        options = {page: 0, max: 20};
                    }
                    return HttpQueue.get($rootScope.api + "/users", {params: options}).success(success).error(error);
                },
                listBaseLocations: function (success, error) {
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
                createUser: function (user, success, error) {
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
                updateUser: function (user, success, error) {
                    var data = {
                        username: user.username,
                        name: user.name,
                        email: user.email,
                        roles: user.roles,
                        baseLocation: user.baseLocation
                    }
                    return HttpQueue.put($rootScope.api + "/users", data).success(success).error(error);
                },
                disableUser: function (user, success, error) {
                    return HttpQueue.put($rootScope.api + "/users/disable/" + user.id).success(success).error(error);
                },
                enableUser: function (user, success, error) {
                    return HttpQueue.put($rootScope.api + "/users/enable/" + user.id).success(success).error(error);
                }
            }
        },
        RoleService: function ($rootScope, HttpQueue) {
            return {
                listAuthorities: function (success, error) {
                    return HttpQueue.get($rootScope.api + "/roles/authorities").success(success).error(error);
                },
                listRoleIds: function (success, error) {
                    return HttpQueue.get($rootScope.api + "/roles/list-ids").success(success).error(error);
                },
                findAll: function (success, error, options) {
                    if (options === undefined) {
                        options = {page: 0, max: 20};
                    }
                    return HttpQueue.get($rootScope.api + "/roles", {params: options}).success(success).error(error);
                },
                createRole: function (role, success, error) {
                    return HttpQueue.post($rootScope.api + "/roles", {
                        id: role.id,
                        authorities: role.authorities
                    }).success(success).error(error);
                },
                updateRole: function (role, success, error) {
                    return HttpQueue.put($rootScope.api + "/roles/" + role.id, {
                        id: role.id,
                        authorities: role.authorities
                    }).success(success).error(error);
                },
                removeRole: function (role, success, error) {
                    return HttpQueue.delete($rootScope.api + "/roles/" + role.id).success(success).error(error);
                }
            }
        },
        JourneyService: function ($rootScope, HttpQueue) {
            return {
                listJourneys: function (success, error, options) {
                    if (options === undefined) {
                        options = {page: 0, size: 50};
                    }
                    return HttpQueue.get($rootScope.api + "/journeys", {params: options}).success(success).error(error);
                }
            }
        },
        BoardingService: function ($rootScope, HttpQueue) {
            return {
                listBoardingMeal: function (success, error, options) {
                    if (options === undefined) {
                        options = {page: 0, size: 50};
                    }
                    return HttpQueue.get($rootScope.api + "/boarding", {params: options}).success(success).error(error);
                }
            }
        }
    });
})();