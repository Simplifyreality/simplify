angular.module('tmweb').controller('ViewJourneyMomentumController', ['$scope', '$route', '$location', '$routeParams', '$window', 'JourneyService', 'UserService', 'IssueService', 'FiltersTransmissionService', function($scope, $route, $location, $routeParams, $window, journeyService, userService, issueService, FiltersTransmissionService) {
  journeyService.fetchJourneyMomentum(function(data) {
    $scope.journey = data;
    $scope.journeyLogs = [];
    $scope.issues = data.issues; // FIXME: USE SERVICE!
    $scope.trainObjectives = data.trainObjectives;
    $scope.users = data.users;
    $scope.journeyLogs = data.logs;
    angular.forEach($scope.journeyLogs, function(val) {
      if(val.passengerNumbers) {
        val.passengerNumbers.spAll = 0;
        val.passengerNumbers.bpAll = 0;
        val.passengerNumbers.compUpgradesAll = 0;
        val.passengerNumbers.joinersAll = 0;
        val.passengerNumbers.upgradesAll = 0;
        val.passengerNumbers.passengersAll = 0;
        if(val.passengerNumbers.coaches) {

          function parseIntForStrings(value) {
            if (value === null || value === '') return 0;
            else return parseInt(value);
          };

          angular.forEach(val.passengerNumbers.coaches, function(values) {
            switch (values.type) {
              case 'SP':
                val.passengerNumbers.spAll += parseIntForStrings(values.compUpgrades) + parseIntForStrings(values.joiners) + parseIntForStrings(values.upgrades) + parseIntForStrings(values.passengers);
                break;
              case 'BP':
                val.passengerNumbers.bpAll += parseIntForStrings(values.compUpgrades) + parseIntForStrings(values.joiners) + parseIntForStrings(values.upgrades) + parseIntForStrings(values.passengers);
            };
            val.passengerNumbers.compUpgradesAll += parseIntForStrings(values.compUpgrades);
            val.passengerNumbers.joinersAll += parseIntForStrings(values.joiners);
            val.passengerNumbers.upgradesAll += parseIntForStrings(values.upgrades);
            val.passengerNumbers.passengersAll += parseIntForStrings(values.passengers);
          });
        }
      }
      else {
        val.passengerNumbers = {
          spAll : 0,
          bpAll : 0,
          compUpgradesAll : 0,
          joinersAll : 0,
          upgradesAll : 0,
          passengersAll : 0
        };
      }
    });
  }, function(error) {
  }, $routeParams.id);

  $scope.tab = $routeParams.tab ? $routeParams.tab : 'stats';

  $scope.showTitle = function(s) {
    if (s['en'] != undefined) {
      return s['en'].title;
    } else if (s['fr'] != undefined) {
      return s['fr'].title;
    } else if (s['nl'].title != undefined) {
      return s['nl'].title;
    }
  };

  $scope.showText = function(s) {
    if (s['en'] != undefined) {
      return s['en'].text;
    } else if (s['fr'] != undefined) {
      return s['fr'].text;
    } else if (s['nl'].text != undefined) {
      return s['nl'].text;
    }
  };

  $scope.changeTab = function(tab) {
    $location.search({tab:tab});
  }

  $scope.viewAll = FiltersTransmissionService.getFilter('journeyControllers');
}]);
