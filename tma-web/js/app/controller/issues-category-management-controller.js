angular.module('tmweb').controller('IssuesCategoryManagementController', ['$scope', 'IssueCategoryService', function($scope, issueCategoryService) {

	//functions for Issue Category modal
	$scope.newIssueCategory = function() {
		$scope.issueCategoryModal = {
			isNewIssueCategory:true,
			category: {},
			subCategories: []
		}
		$('#issueCategoryModal').foundation('reveal', 'open');
	};

	$scope.cancelModal = function() {
		$('#issueCategoryModal').foundation('reveal', 'close');
	};

	$scope.list = function() {
		issueCategoryService.listCategories(function(data) {
			$scope.categories = data;
		}, function(error, status) {
			alert("Error from server");
		}).run();
	}

	$scope.editCategory = function(category) {
		$scope.issueCategoryModal = {
			isNewIssueCategory: false,
			category: {
				id: category.id,
				title_en: category.title_en,
				title_fr: category.title_fr,
				deleted: category.deleted
			},
			subCategories: []
		}
		for (var c = 0; c < category.subCategories.length; c++) {
			$scope.issueCategoryModal.subCategories.push({
				id: category.subCategories[c].id,
				title_en: category.subCategories[c].title_en,
				title_fr: category.subCategories[c].title_fr,
				deleted: category.subCategories[c].deleted
			});
		}
		$('#issueCategoryModal').foundation('reveal', 'open');
	}

	$scope.hideCategory = function(category, subCategory) {
		if (subCategory === undefined) {
			category.deleted = true;
		} else {
			subCategory.deleted = true;
		}
		issueCategoryService.updateCategory(category, function(data) {
			$scope.list();
		}, function(error, status) {
			$scope.isGenericError = true;
			console.log(error);
		}).run();
	}

	$scope.showCategory = function(category, subCategory) {
		if (subCategory === undefined) {
			category.deleted = false;
		} else {
			subCategory.deleted = false;
		}
		issueCategoryService.updateCategory(category, function(data) {
			$scope.list();
		}, function(error, status) {
			$scope.isGenericError = true;
			console.log(error);
		}).run();
	}

	$scope.addSubCategory = function() {
		$scope.issueCategoryModal.subCategories.push({title_en:"", title_fr:""});
	}

	$scope.removeSubCategory = function(index) {
		if ($scope.issueCategoryModal.subCategories === undefined) {
			$scope.issueCategoryModal.subCategories = [];
		}
		console.log($scope.issueCategoryModal.subCategories.length);
		var subCategories = [];
		for (var i = 0 ; i < $scope.issueCategoryModal.subCategories.length; i++) {
			if (i == index) {
				continue;
			}
			subCategories.push($scope.issueCategoryModal.subCategories[i]);
		}
		$scope.issueCategoryModal.subCategories = subCategories;

		console.log($scope.issueCategoryModal.subCategories.length);
	}

	$scope.saveCategory = function() {
		var isNewCategory = $scope.issueCategoryModal.isNewIssueCategory;
		$scope.issueCategoryModal.category.subCategories = $scope.issueCategoryModal.subCategories;
		var success = function(data) {
			$scope.resetErrors(); // reset all errors first...
			$scope.list();
			$scope.cancelModal();
			if (isNewCategory) {
				$scope.issueCategoryAdded = true;
			} else {
				$scope.issueCategoryUpdated = true;
			}
		}
		var error = function(error, status) {
			$scope.resetErrors(); // reset all errors first...
				if (status == 400) {
					$scope.issueCategoryModal.isValidationError = true;
					angular.forEach(error.fieldErrors, function(e, i) {
						$scope.issueCategoryModal.errors[e.path] = e.message;
					});
				} else {
					$scope.issueCategoryModal.isGenericError = true;
				}
		}
		if (isNewCategory) {
			issueCategoryService.createCategory($scope.issueCategoryModal.category, success, error).run();
		} else {
			issueCategoryService.updateCategory($scope.issueCategoryModal.category, success, error).run();
		}
	}

	$scope.resetErrors = function() {
		$scope.isValidationError = false;
		$scope.isGenericError = false;
		$scope.issueCategoryModal.isValidationError = false;
		$scope.issueCategoryModal.isGenericError = false;
		$scope.issueCategoryModal.errors = {};
		$scope.issueCategoryAdded = false;
		$scope.issueCategoryUpdated = false;
	}
}]);