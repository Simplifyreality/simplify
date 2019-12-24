angular.module('tmweb').service('JourneyService', ['$rootScope', 'HttpQueue', function($rootScope, HttpQueue) {
	return {
		listJourneys: function(success, error, options) {
			if (options === undefined) {
				options = {page: 0, size: 50};
			}
			return HttpQueue.get($rootScope.api + "/journeys", {params:options}).success(success).error(error);
		},
		fetchJourney: function(success, error, id) {
			return HttpQueue.get($rootScope.api + "/journeys/" + id).success(success).error(error);
		},
		fetchJourneyMomentum: function(success, error, id) {
			return HttpQueue.get($rootScope.api + "/momentum_logs/" + id).success(success).error(error);
		},
		fetchJourneyForIssue: function(id, success, error) {
			return HttpQueue.get($rootScope.api + "/journeys/issues/" + id).success(success).error(error);
		}
	}
}]);