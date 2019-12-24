angular.module('tmweb').service('FiltersTransmissionService', ['$window', function($window) {
  return {
    setFilter: function (scopeName, filters) {
      $window.localStorage.setItem(scopeName, filters);
    },
    getFilter: function (scopeName) {
      return $window.localStorage.getItem(scopeName);
    }
  };
}]);
