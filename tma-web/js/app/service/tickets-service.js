angular.module('tmweb').service('TicketsService', ['$rootScope', 'HttpQueue', function($rootScope, HttpQueue) {
	return {
		listTickets: function(success, error, options) {
			if (options === undefined) {
				options = {page: 0, max: 50};
			}
			return HttpQueue.get($rootScope.api + "/tickets", {params:options}).success(success).error(error);
		},
	}
}]);