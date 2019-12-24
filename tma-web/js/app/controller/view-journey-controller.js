angular.module('tmweb').controller('ViewJourneyController', ['$scope', '$route', '$location', '$routeParams','JourneyService', 'UserService', 'IssueService', function($scope, $route, $location, $routeParams, journeyService, userService, issueService) {
	journeyService.fetchJourney(function(data) {
		$scope.journey = data;
		$scope.journeyLogs = [];
		$scope.issues = data.issues; // FIXME: USE SERVICE!
		$scope.trainObjectives = data.trainObjectives;
		$scope.users = data.users;
		$scope.trainPreparation = {
			user: data.isPreparationsDone ? data.preparationsDoneUsername : null,
			comment: data.preparationsComment,
			isPreparationsDone: data.isPreparationsDone,
		};
		angular.forEach(data.journeyLogs, function(value, key) {
			value.username = key;
			$scope.journeyLogs.push(value);
		});
	}, function(error) {
	}, $routeParams.id);

	$scope.tab = $routeParams.tab ? $routeParams.tab : 'crew';

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
}]);