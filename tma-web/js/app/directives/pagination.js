angular.module('tmweb').directive('pagination', function() {
	return {
		replace: true,
		scope: {
			callback: "=",
			content: "="
		},
		templateUrl: 'templates/pagination.html',
		link: function(scope, element, attrs) {
			scope.$watch('content', function(newValue, oldValue) { scope.init(); }, true);
		},
		controller: function($scope) {
			$scope.init = function() {
				if ($scope.content === undefined) {
					return;
				}
				$scope.pages = [];
				for (var i = 0; i < $scope.content.totalPages; i++) {
					$scope.pages.push({
						number: i,
						page: (i + 1), 
						firstPage:(i == 0), 
						lastPage: ((i+1) == $scope.content.totalPages), 
						current:(i == $scope.content.number)
					}); // just to make life easier in repeat and we can do some interesting bits
					if ($scope.content.firstPage) {
						delete $scope.previousPage;
					} else {
						$scope.previousPage = {
							page: ($scope.content.number - 1),
							firstPage:(i == 0),
							lastPage:false,
							current: false
						}
					}
					if ($scope.content.lastPage) {
						delete $scope.nextPage;
					} else {
						$scope.nextPage = {
							page: ($scope.content.number + 1),
							firstPage:false,
							lastPage:(($scope.content.number + 1) == $scope.content.totalPages),
							current: false
						}
					}
				}
			}
		}
	}
});