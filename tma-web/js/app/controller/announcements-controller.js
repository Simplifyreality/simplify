angular.module('tmweb')
  .controller('AnnouncementsController',
    ['$rootScope', '$scope', '$location', '$routeParams', '$translate', '$route', '$window', 'AnnouncementService',
      function ($rootScope, $scope, $location, $routeParams, $translate, $route, $window, announcementService) {
        const LANG = ['en', 'nl', 'fr', 'de'];
        $scope.announcements = [];
        $scope.tabs = ['RoutineAnnouncements', 'Disruption', 'Evacuation'];
        $scope.columns = {
          "RoutineAnnouncements": [
            { key: 'routename', title: "announcements.routine.table.city" },
            { key: 'subCategory', title: "announcements.routine.table.subcategory" },
          ],
          "Disruption": [
            { key: 'subCategory', title: "announcements.routine.table.subcategory" },
          ],
          "Evacuation": [
            { key: 'subCategory', title: "announcements.routine.table.subcategory" },
          ],
        };

        announcementService.getCategories(null, function (data) {
          var cats = [{ value: '', name: $translate('announcements.selectCategories.placeholder'), disabled: true }];
          angular.forEach(data, function (v, d) {
            cats.push({ value: v, name: v });
          });
          $scope.categories = cats;
        }, onError).run();

        announcementService.getRoutes(function (data) {
          var routes = [{ value: '', name: $translate('announcements.selectRoute.placeholder'), disabled: true }];
          angular.forEach(data, function (v, d) {
            routes.push({ value: v, name: v });
          });
          $scope.routes = routes;
        }, onError).run();

        $scope.hasPermission = function (permission) {
          if ($rootScope.user === undefined || $rootScope.user.permissions === undefined) {
            return false;
          }
          var isPermitted = false;
          angular.forEach($rootScope.user.permissions, function (p, i) {
            if (p.toUpperCase() == permission.toUpperCase()) {
              isPermitted = true;
            }
          });
          return isPermitted;
        };

        $scope.list = function () {
          $scope.options = {
            size: 50,
          };

          setListParams();

          announcementService.fetchStandardAnnouncements($scope.options, function (data) {
            $scope.data = data;
            $scope.announcements = [];
            angular.forEach(data.content, function (a) {
              for (var i = 0; i < LANG.length; i++) {
                const lang = LANG[i];
                if (a.script[lang] === undefined) {
                  a.script[lang] = {};
                  break;
                }
              }
              $scope.announcements.push(a);
            });
            $(document).foundation('section', 'reflow'); // angular hack
          }, function () {
            alert("there was a communication error");
          }).run();
        };

        $scope.changeTab = function (tab) {
          $scope.announcementsTab = tab;
          $location.search({ tab: tab });
        };

        $scope.newAnnouncement = function () {
          $scope.announcementsModal = {
            isNewAnnouncement: true,
            announcement: {
              script: {
                'en': { title: '', script: '' },
                'fr': { title: '', script: '' },
                'nl': {},
                'de': {},
              },
              routename: "",
              category: $scope.announcementsTab,
              subCategory: "",
            },
            trainNumbers: [],
          };
          $scope.setupSelectionPlaces();
          $scope.setupSelectionCategories();
          $scope.updateSubCategories();
          $scope.$watch('announcementsModal.announcement.category', function () {
            $scope.updateSubCategories();
          });
          $('#announcementsModal').foundation('reveal', 'open');
        };

        $scope.editAnnouncement = function (announcement) {
          var model = {};
          angular.copy(announcement, model);
          angular.forEach(LANG, function(lang) {
            model.script[lang] = model.script[lang] || {};
          });
          $scope.announcementsModal = {
            isNewAnnouncement: false,
            announcement: model //announcement
          };

          $('#announcementsModal').foundation('reveal', 'open');
        };

        $scope.cancelModal = function () {
          $('#announcementsModal').foundation('reveal', 'close');
        };

        $scope.saveAnnouncement = function () {
          var success = function () {
            $scope.resetErrors(); // reset all errors first...
            $scope.list();
            if ($scope.announcementsModal.isNewAnnouncement) {
              $scope.announcementAdded = $scope.announcementsModal.announcement;
            } else {
              $scope.announcementUpdated = $scope.announcementsModal.announcement;
            }
            $scope.announcementsModal = {};
            $scope.cancelModal();
          };
          var error = function (error, status) {
            $scope.resetErrors(); // reset all errors first...
            if (status == 400) {
              $scope.announcementsModal.isValidationError = true;
              angular.forEach(error.fieldErrors, function (e, i) {
                $scope.announcementsModal.errors[e.path] = e.message;
              });
            } else {
              $scope.announcementsModal.isGenericError = true;
            }
          };

          // Create or update
          var errorTab = checkAnnouncementsScripts($scope.announcementsModal.announcement.script);
          // english and french tabs are required
          if (errorTab.length) {
            $scope.tab = errorTab === 'en' ? 'english' : 'french';
          } else if ($scope.announcementsModal.isNewAnnouncement) {
            announcementService.createStandardAnnouncement($scope.announcementsModal.announcement, success, error).run();
          } else {
            announcementService.updateStandardAnnouncement($scope.announcementsModal.announcement, success, error).run();
          }
        };

        $scope.deleteAnnouncement = function (announcement) {
          if ($window.confirm("Are you sure?")) {
            announcementService.deleteAnnouncement(announcement.id,
              function (data) {
                $route.reload();
              }, function (error, status) {
              },
            ).run();
          }
          return false;
        };

        $scope.setupSelectionPlaces = function () {
          $scope.announcementsModal.routes = $scope.routes;
        };

        $scope.setupSelectionCategories = function () {
          $scope.announcementsModal.categories = $scope.categories;
        };

        $scope.updateSubCategories = function () {
          if ($scope.announcementsModal === undefined || $scope.announcementsModal.announcement === undefined ||
            $scope.announcementsModal.announcement.subCategory !== '') {
            return;
          }

          var cats = [{ value: '', name: $translate('announcements.selectSubCategories.placeholder'), disabled: true }];
          if ($scope.announcementsModal.announcement.category == '') {
            $scope.announcementsModal.announcement.subCategory = '';
            $scope.announcementsModal.subCategories = cats;
            return;
          }

          announcementService.getCategories($scope.announcementsModal.announcement.category, function (data) {
            angular.forEach(data, function (sv, s) {
              cats.push({ value: sv, name: sv });
            });
            $scope.announcementsModal.announcement.subCategory = '';
            $scope.announcementsModal.subCategories = cats;
          }, onError).run();
        };

        $scope.resetErrors = function () {
          $scope.isValidationError = false;
          $scope.isGenericError = false;
          $scope.announcementsModal.isValidationError = false;
          $scope.announcementsModal.isGenericError = false;
          $scope.announcementsModal.errors = {};
          $scope.announcementUpdated = false;
        };

        $scope.sort = function (column, event) {
          if (!column && event) {
            column = $(event.target).attr('data-column');
          }

          var columnName = column + '.dir';
          if ($scope.options[columnName] === 'ASC') {
            $scope.options[columnName] = 'DESC';
          } else {
            $scope.options[columnName] = 'ASC';
          }

          $location.search($scope.options);
        };

        $scope.changePage = function (page) {
          if (page < 0) {
            page = 0;
          }
          if ($scope.options === undefined) {
            $scope.options = { size: 50, page: page };
          } else {
            $scope.options.page = page;
          }
          $location.search($scope.options);
        };

        $scope.$watch('announcementsModal.announcement.category', function (category) {
          if (!$scope.announcementsModal || !$scope.announcementsModal.isNewAnnouncement) {
            return;
          }

          if (category != "RoutineAnnouncements") {
            $scope.announcementsModal.announcement.routename = "";
          }
        });

        function checkAnnouncementsScripts(scripts) {
          var hasErrors = '';
          $scope.announcementsModal.errors = {};
          const langs = ['fr', 'en'];
          const fields = ['title', 'script'];
          var key = '';

          for (var i = 0; i < langs.length; i++) {
            if (Object.keys(scripts[langs[i]]).length) {
              for (var j = 0; j < fields.length; j++) {
                if (!scripts[langs[i]][[fields[j]]].length) {
                  $scope.announcementsModal.isValidationError = true;
                  hasErrors = langs[i];
                  key = 'script[' + langs[i] + '].' + fields[j];
                  $scope.announcementsModal.errors[key] = 'NotBlank.editableStandardAnnouncementDTO.' + key;
                }
              }
            } else {
              $scope.announcementsModal.isValidationError = true;
              hasErrors = langs[i];
              for (var k = 0; k < fields.length; k++) {
                key = 'script[' + langs[i] + '].' + fields[k];
                $scope.announcementsModal.errors[key] = 'NotBlank.editableStandardAnnouncementDTO.' + key;
              }
            }
          }
          return hasErrors;
        }


        function onError(err) {
          console.log('Error occurred');
        }

        function setListParams() {
          // Sort
          if ($routeParams.type === 'RoutineAnnouncements' || $routeParams.tab === 'RoutineAnnouncements') {
            $scope.options['routename.dir'] = $routeParams['routename.dir'] || 'ASC';
          }

          $scope.options['subCategory.dir'] = $routeParams['subCategory.dir'] || 'ASC';

          if ($routeParams.page === undefined || $routeParams.page < 0) {
            $scope.options.page = 0;
          } else {
            $scope.options.page = $routeParams.page;
          }

          if ($routeParams.type) {
            $scope.options.depot = $routeParams.type;
          } else if ($routeParams.depot === undefined || ($routeParams.depot && $routeParams.depot.toLowerCase() === "null")) {
            $scope.options.depot = 'RoutineAnnouncements';
          } else {
            $scope.options.depot = $routeParams.depot;
            $scope.tab = $routeParams.depot;
          }

          if ($routeParams.type) {
            $scope.announcementsTab = $routeParams.type;
          } else {
            $scope.announcementsTab = $routeParams.tab ? $routeParams.tab : 'RoutineAnnouncements';
          }
          $scope.options.type = $scope.announcementsTab;
        }

      }]);
