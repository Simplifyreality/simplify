angular.module('tmweb').service('FaultService', ['$rootScope', 'HttpQueue', function($rootScope, HttpQueue) {
	return {
		listFaults: function(success, error, options, isCleaning) {
			if (options === undefined) {
				options = {page: 0, size: 50};
			}
			if (isCleaning) options.severity = 'CLEANING'
      else if (!options.severity) options.severity = ['CARNET', 'DEPECHE']

			if (options.depot !== undefined && options.depot == "ALL") {
				delete options.depot;
			}
			return HttpQueue.get($rootScope.api + "/faults", {params:options}).success(success).error(error);
		},
		fetchFault: function(success, error, id) {
			return HttpQueue.get($rootScope.api + "/faults/" + id).success(success).error(error);
		},
		updateFaultStatus: function(id, fault, success, error) {
			var update = {}
			if (fault.assignedDepot != -1) {
				update.assignedDepot = fault.assignedDepot
			}
			if (fault.status != -1) {
				update.status = fault.status;
			}
			if (fault.priority != -1) {
				update.priority = fault.priority;
			}
			update.depotComments = fault.depotComments;
			console.log(update);
			return HttpQueue.put($rootScope.api + "/faults/" + id, update).success(success).error(error);
		}
	}
}]);
