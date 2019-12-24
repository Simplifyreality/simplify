angular.module('tmweb').service('IssueService', ['$rootScope', 'HttpQueue', function($rootScope, HttpQueue) {
	return {
		listIssues: function(success, error, options) {
			if (options === undefined) {
				options = {page: 0, size: 50};
			}
			return HttpQueue.get($rootScope.api + "/issues", {params:options}).success(success).error(error);
		},
		findIssuesForJourney: function(id, success, error) {
			// ID is the ID of the journey
			return HttpQueue.get($rootScope.api + "/issues/journey/" + id).success(success).error(error);
		},
		fetchIssue: function(success, error, id) {
			return HttpQueue.get($rootScope.api + "/issues/" + id).success(success).error(error);
		}
	}
}]);