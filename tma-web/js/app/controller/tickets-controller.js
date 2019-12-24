angular.module('tmweb').controller('TicketsController',
  ['$rootScope', '$scope', '$location', '$routeParams', 'TicketsService',
    function ($rootScope, $scope, $location, $routeParams, ticketsService) {

      // Click a button
      $scope.list = function () {
        $scope.options = {
          max: 50,
        };
        if ($routeParams.page === undefined || $routeParams.page < 0) {
          $scope.options.page = 0;
        } else {
          $scope.options.page = $routeParams.page;
        }
        $scope.results = [];
        // Fetch the tickets from the server
        ticketsService.listTickets(function(data) {
          $scope.results = data;
        }, function(error) {
        	alert("FIXME: Create error handler");
        }, $scope.options);
      };

      $scope.changePage = function (page) {
        if (page < 0) {
          page = 0;
        }
        if ($scope.options === undefined) {
          $scope.options = { max: 50, page: page };
        } else {
          $scope.options.page = page;
        }
        $location.search($scope.options);
      };
    }]);