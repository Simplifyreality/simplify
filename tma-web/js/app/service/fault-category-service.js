angular.module('tmweb').service('FaultCategoryService', ['$rootScope', 'HttpQueue', function($rootScope, HttpQueue) {
  return {
    listCategories: function(success, error) {
      return HttpQueue.get($rootScope.api + "/fault_categories").success(success).error(error);
    },
    createCategory: function(category, success, error) {
      return HttpQueue.post($rootScope.api + '/fault_categories', category).success(success).error(error);
    },
    updateCategory: function(category, success, error) {
      return HttpQueue.put($rootScope.api + '/fault_categories/' + category.id, category).success(success).error(error);
    }
  }
}]); 
