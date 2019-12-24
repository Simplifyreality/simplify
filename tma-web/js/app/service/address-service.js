angular.module('tmweb').service('AddressService', ['$rootScope', 'HttpQueue', function($rootScope, HttpQueue) {
	return {
		listAddressesByType: function(type, success, error) {
			return HttpQueue.get($rootScope.api + "/addresses", {params:{type:type}}).success(success).error(error);
		},
		createAddress: function(address, success, error) {
			// Setup model
			var model = {addressType: address.addressType, category: address.category, subCategory:address.subCategory, addresses:address.addresses};
			if (model.category == '-1') {
				delete model.category;
			}
			if (model.subCategory == '-1') {
				delete model.subCategory;
			}
			return HttpQueue.post($rootScope.api + "/addresses", model).success(success).error(error);
		},
		updateAddress: function(address, success, error) {
			// Setup model
			var model = {id:address.id, addressType: address.addressType, category: address.category, subCategory:address.subCategory, addresses:address.addresses};
			if (model.category == '-1') {
				delete model.category;
			}
			if (model.subCategory == '-1') {
				delete model.subCategory;
			}
			return HttpQueue.put($rootScope.api + "/addresses/" + model.id, model).success(success).error(error);
		}
	}
}]);