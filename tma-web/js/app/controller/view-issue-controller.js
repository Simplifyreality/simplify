angular.module('tmweb').controller('ViewIssueController', ['$scope', '$route', '$routeParams', '$window', 'IssueService', 'JourneyService', 'UserService', 'FiltersTransmissionService', function($scope, $route, $routeParams, $window, issueService, journeyService, userService, FiltersTransmissionService) {

	issueService.fetchIssue(function(data) {
		$scope.issue = data;
		if (data.createdBy != undefined) {
			userService.findById(data.createdBy, function(u) {
				$scope.user = u;
				journeyService.fetchJourneyForIssue($scope.issue.id, function(j) {
					$scope.journey = j;
					$scope.role = j.journeyLogs[u.name].role;
				}, function(error, status) {
					// do nothing here
				}).run();
			}, function(err, status) {

			}).run();
		}
	}, function(error) {
	}, $routeParams.id).run();

  $scope.viewAll = FiltersTransmissionService.getFilter('issueControllers')
  $scope.clearSavedJourneyFilter = function () {
    FiltersTransmissionService.setFilter('journeyControllers', '/journeys-momentum');
  };
}]);
