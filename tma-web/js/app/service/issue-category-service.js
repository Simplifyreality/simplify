angular.module('tmweb').service('IssueCategoryService', ['$rootScope', 'HttpQueue', function($rootScope, HttpQueue) {
	return {
		listCategories: function(success, error) {
			return HttpQueue.get($rootScope.api + "/issue_categories").success(success).error(error);
		},
		createCategory: function(category, success, error) {
			return HttpQueue.post($rootScope.api + '/issue_categories', category).success(success).error(error);
		},
		updateCategory: function(category, success, error) {
			return HttpQueue.put($rootScope.api + '/issue_categories/' + category.id, category).success(success).error(error);
		}
	}
}]);