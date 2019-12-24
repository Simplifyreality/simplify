angular.module('tmweb').service('TrainObjectiveService', ['$rootScope', 'HttpQueue', function($rootScope, HttpQueue) {
	return {
		list: function(options, success, error) {
			if (options === undefined) {
				options = {page: 0, size: 50};
			}
			return HttpQueue.get($rootScope.api + "/objectives", {params:options}).success(success).error(error);
		},
		create: function(t, success, error) {
			var to;
			if (t.to != undefined) {
				var parts = t.to.split("-");
				to = new Date(parts[2] + "-" + parts[1] + "-" + parts[0]);
			}
			var from;
			if (t.from != undefined) {
				var parts = t.from.split("-");
				from = new Date(parts[2] + "-" + parts[1] + "-" + parts[0]);
			}
			var toSave = {
				to: to,
				from: from,
				scripts: {}
			};
			angular.forEach(t.scripts, function(script, key) {
				if (script == null) {
					return;
				}
				if ((script.title != undefined && script.title.length > 0) || (script.script != undefined && script.script.length > 0)) {
					toSave.scripts[key] = script;
				}
			});
			return HttpQueue.post($rootScope.api + "/objectives", toSave).success(success).error(error);
		},
		remove: function(t, success, error) {
			return HttpQueue.delete($rootScope.api + "/objectives/" + t).success(success).error(error);
		},
		update: function(t, success, error) {
			var to = null;
			if (t.to != undefined) {
				var parts = t.to.split("-");
				to = new Date(parts[2] + "-" + parts[1] + "-" + parts[0]);
			}
			var from = null;
			if (t.from != undefined) {
				var parts = t.from.split("-");
				from = new Date(parts[2] + "-" + parts[1] + "-" + parts[0]);
			}
			var toSave = {
				id: t.id,
				to: to,
				from: from,
				scripts: {}
			};
			angular.forEach(t.scripts, function(script, key) {
				if (script === undefined) {
					return;
				}
				if ((script.title != undefined && script.title.length > 0) || (script.script != undefined && script.script.length > 0)) {
					toSave.scripts[key] = script;
				}
			});
			return HttpQueue.put($rootScope.api + "/objectives/" + t.id, toSave).success(success).error(error);
		}
	}
}]);