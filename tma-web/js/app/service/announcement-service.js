angular.module('tmweb').service('AnnouncementService', ['$rootScope', 'HttpQueue', function ($rootScope, HttpQueue) {
  return {
    listPersonalAnnouncements: function (user, success, error) {
      return HttpQueue.get($rootScope.api + "/users/announcements/" + user).success(success).error(error);
    },
    listSpecialAnnouncements: function (options, success, error) {
      if (options.page === undefined) {
        options.page = 0;
      }
      if (options.size === undefined) {
        options.size = 25;
      }
      return HttpQueue.get($rootScope.api + '/special-announcements', { params: options }).success(success).error(error);
    },
    fetchStandardAnnouncements: function (options, success, error) {
      if (options.page === undefined) {
        options.page = 0;
      }
      if (options.size === undefined) {
        options.size = 25;
      }
      return HttpQueue.get($rootScope.api + "/standard-announcements", { params: options }).success(success).error(error);
    },
    deleteSpecial: function (id, success, error) {
      return HttpQueue['delete']($rootScope.api + "/special-announcements/" + id).success(success).error(error);
    },
    createStandardAnnouncement: function (announcement, success, err) {
      var toSave = {
        category: announcement.category,
        subCategory: announcement.subCategory,
        routename: announcement.routename,
        routecode: announcement.routecode,
        code: announcement.code,
        script: {},
      };
      angular.forEach(announcement.script, function (script, key) {
        if (script === undefined) {
          return;
        }
        if ((script.title != undefined && script.title.length > 0) || (script.script != undefined && script.script.length > 0)) {
          toSave.script[key] = script;
        }
      });
      return HttpQueue.post($rootScope.api + "/standard-announcements", toSave).success(success).error(err);
    },
    updateStandardAnnouncement: function (announcement, success, error) {
      var toSave = {
        id: announcement.id,
        category: announcement.category,
        subCategory: announcement.subCategory,
        routename: announcement.routename,
        routecode: announcement.routecode,
        code: announcement.code,
        script: {},
      };
      angular.forEach(announcement.script, function (script, key) {
        if (script === undefined) {
          return;
        }
        if ((script.title != undefined && script.title.length > 0) || (script.script != undefined && script.script.length > 0)) {
          toSave.script[key] = script;
        }
      });
      return HttpQueue.put($rootScope.api + '/standard-announcements/' + announcement.id, toSave).success(success).error(error);
    },
    deleteAnnouncement: function (id, success, error) {
      return HttpQueue['delete']($rootScope.api + "/standard-announcements/" + id).success(success).error(error);
    },
    createSpecialAnnouncement: function (special, success, err) {
      var toSave = {
        startDate: special.startDate,
        endDate: special.endDate,
        trainNumbers: special.trainNumbers,
        script: {},
      };
      angular.forEach(special.script, function (script, key) {
        if (script === undefined) {
          return;
        }
        if ((script.title != undefined && script.title.length > 0) || (script.script != undefined && script.script.length > 0)) {
          toSave.script[key] = script;
        }
      });
      return HttpQueue.post($rootScope.api + "/special-announcements", toSave).success(success).error(err);
    },
    updateSpecialAnnouncement: function (special, success, err) {
      var toSave = {
        id: special.id,
        startDate: special.startDate,
        endDate: special.endDate,
        trainNumbers: special.trainNumbers,
        script: {},
      };
      angular.forEach(special.script, function (script, key) {
        if (script === undefined) {
          return;
        }
        if ((script.title != undefined && script.title.length > 0) || (script.script != undefined && script.script.length > 0)) {
          toSave.script[key] = script;
        }
      });
      return HttpQueue.put($rootScope.api + "/special-announcements/" + special.id, toSave).success(success).error(err);
    },

    // Wrong place for this...
    uploadDailyOrder: function (fileData, success, err) {
      return HttpQueue.post($rootScope.api + "/daily_orders", fileData, {
        headers: { "Content-Type": "application/pdf" },
        transformRequest: angular.identity,
      }).success(success).error(err);
    },
    getDailyOrder: function (success, err) {
      return HttpQueue.get($rootScope.api + "/daily_orders").success(success).error(err);
    },
    getCategories: function (parent, success, err) {
      return HttpQueue.get($rootScope.api + "/announcement-categories/categories" + (parent ? "/" + parent : "")).success(success).error(err);
    },
    getRoutes: function (success, err) {
      return HttpQueue.get($rootScope.api + "/announcement-categories/places").success(success).error(err);
    },
  };
}]);