angular.module('tmweb').service('MessageService', ['$rootScope', 'HttpQueue', function($rootScope, HttpQueue) {
    return {
        postMessage: function(halfSets, trains, date, endDate, role, message, toAll, success, error) {
            var d, dateTo;
            if (date === undefined) {
                d = Date.parse(new Date());
            } else {
                var parts = date.split("-");
                d = Date.parse(new Date(parts[2] + "-" + parts[1] + "-" + parts[0] + "T00:00:00Z"));
            }
            if (endDate) {
                var endDateParts = endDate.split("-");
                dateTo = Date.parse(new Date(endDateParts[2] + "-" + endDateParts[1] + "-" + endDateParts[0] + "T00:00:00Z"));
            } else {
                dateTo = null;
            }
            var data = { halfSets: halfSets, trainNumber: trains, startDate: d, endDate: dateTo, role: role, message: message };
            if (toAll) {
                data.toAll = toAll;
            }
            return HttpQueue.post($rootScope.api + "/messages", data).success(success).error(error);

        },
        postFutureMessage: function(message, success, error) {
            var d;
            if (message.date === undefined) {
                d = Date.parse(new Date());
            } else {
                var parts = message.date.split("-");
                d = Date.parse(new Date(parts[2] + "-" + parts[1] + "-" + parts[0] + "T00:00:00Z"));
            }
            return HttpQueue.post($rootScope.api + "/messages/future", { trainNumber: message.trainNumber, date: d, message: message.message }).success(success).error(error);

        },
        markAsRead: function(id, success, error) {
            return HttpQueue.put($rootScope.api + "/messages/mark", [id]).success(success).error(error);
        },
        fetchMessagesCancel: function(halfSets, trains, date, endDate, role, success, error) {
            return HttpQueue.getWithCancel($rootScope.api + "/messages", { params: { halfSet: halfSets, trainNumber: trains, startDate: date, endDate: endDate, role: role } }).error(error).success(success);
        },
        fetchMessages: function(trains, date, role, success, error) {
            return HttpQueue.get($rootScope.api + "/messages", { params: { trainNumber: trains, startDate: date, role: role } }).error(error).success(success);
        },
        update: function(id, halfSets, trains, date, endDate, role, message, toAll, success, error) {
            var d, dateTo;
            if (date === undefined) {
                d = Date.parse(new Date());
            } else {
                var parts = date.split("-");
                d = Date.parse(new Date(parts[2] + "-" + parts[1] + "-" + parts[0] + "T00:00:00Z"));
            }
            if (endDate) {
                var endDateParts = endDate.split("-");
                dateTo = Date.parse(new Date(endDateParts[2] + "-" + endDateParts[1] + "-" + endDateParts[0] + "T00:00:00Z"));
            } else {
                dateTo = null;
            }
            var data = { halfSets: halfSets, trainNumber: trains, startDate: d, endDate: dateTo, role: role, message: message };
            if (toAll) {
                data.toAll = toAll;
            }
            return HttpQueue.post($rootScope.api + "/messages/" + id, data).success(success).error(error);
        },
        remove: function(m, success, error) {
            return HttpQueue.delete($rootScope.api + "/messages/" + m).success(success).error(error);
        },
    }
}]);