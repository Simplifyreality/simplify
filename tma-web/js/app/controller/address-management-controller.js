angular.module('tmweb').controller('AddressManagementController', ['$scope', '$location', '$routeParams', '$translate', 'AddressService', 'IssueCategoryService', 'FaultCategoryService', function ($scope, $location, $routeParams, $translate, addressService, issueCategoryService, faultCategoryService) {

  // setup current tab...
  $scope.tab = $routeParams.type ? $routeParams.type : 'ISSUES';
  $scope.canAddAddress = false;
  $scope.safety = [
    { value: '-1', name: $translate('addressManagement.selectCategories.placeholder'), disabled: true },
    { value: 'ACCIDENT', name: $translate('addressManagement.safety.ACCIDENT') },
    { value: 'HAZARD', name: $translate('addressManagement.safety.HAZARD') },
    { value: 'OPERATIONAL', name: $translate('addressManagement.safety.OPERATIONAL') },
    { value: 'DRIVER', name: $translate('addressManagement.safety.DRIVER') },
  ];
  $scope.taxiOperators = [
    { value: '-1', name: $translate('addressManagement.selectCategories.placeholder'), disabled: true },
    { value: 'PARIS', name: $translate('addressManagement.destination.PARIS') },
    { value: 'BRUSSELS', name: $translate('addressManagement.destination.BRUSSELS') },
    { value: 'LONDON', name: $translate('addressManagement.destination.LONDON') },
    { value: 'AMSTERDAM', name: $translate('addressManagement.destination.AMSTERDAM') },
  ];
  $scope.hotels = [
    { value: '-1', name: $translate('addressManagement.selectCategories.placeholder'), disabled: true },
    { value: 'LONDON', name: $translate('addressManagement.destination.LONDON') },
    { value: 'LILLE', name: $translate('addressManagement.destination.LILLE') },
    { value: 'PARIS', name: $translate('addressManagement.destination.PARIS') },
    { value: 'BRUSSELS', name: $translate('addressManagement.destination.BRUSSELS') },
    { value: 'AMSTERDAM', name: $translate('addressManagement.destination.AMSTERDAM') },
    { value: 'ROTTERDAM', name: $translate('addressManagement.destination.ROTTERDAM') },
  ];
  $scope.list = function () {
    issueCategoryService.listCategories(function (categories) {
      // Execute after we get a success
      $scope.categories = {};
      $scope.subCategories = {};

      angular.forEach(categories, function (cv, c) {
        $scope.categories[cv.id] = cv;
        angular.forEach(cv.subCategories, function (sv, s) {
          $scope.subCategories[sv.id] = sv;
        });
      });
      addressService.listAddressesByType($scope.tab, function (addresses) {
        $scope.addresses = addresses;
        if (($scope.tab === 'SPECIAL_REQUIREMENTS' || $scope.tab === 'NO_SHOW') && addresses.length > 0) {
          $scope.canAddAddress = false;
        } else {
          $scope.canAddAddress = true;
				}
      }, function (error, status) {
        alert("Error from server");
      }).run();
    }, function (error, status) {
      alert("Error from server");
    }).run();
    faultCategoryService.listCategories(function (categories) {
      $scope.faultCategories = {};
      $scope.faultSubCategories = {};

      angular.forEach(categories, function (cv, c) {
        $scope.faultCategories[cv.id] = cv;
        angular.forEach(cv.subCategories, function (sv, s) {
          $scope.faultSubCategories[sv.id] = sv;
        });
      });
    }, function (error, status) {
      alert("Error from server");
    }).run();
  };

  $scope.changeTab = function (tab) {
    $location.search({ type: tab });
  };

  $scope.saveAddress = function () {
    // Get basic attributes
    var isNewAddress = $scope.addressManagementModal.isNewAddress;
    var address = $scope.addressManagementModal.address;
    if (address.addressType === 'SPECIAL_REQUIREMENTS') {
      address.category = 'SPECIAL_REQUIREMENTS';
    }
    if (address.addressType === 'NO_SHOW') {
      address.category = 'NO_SHOW';
    }
    var success = function (data) {
      $scope.resetErrors(); // reset all errors first...
      $scope.list();
      if (isNewAddress) {
        $scope.addressAdded = address;
      } else {
        $scope.addressUpdated = address;
      }
      $scope.cancelModal();
    };
    var error = function (error, status) {
      $scope.resetErrors(); // reset all errors first...
      if (status == 400) {
        angular.forEach(error.fieldErrors, function (e, i) {
          $scope.addressManagementModal.errors[e.path] = e.message;
        });
      } else {
        $scope.addressManagementModal.isGenericError = true;
      }
    };
    if (isNewAddress) {
      addressService.createAddress(address, success, error).run();
    } else {
      addressService.updateAddress(address, success, error).run();
    }
  };

  $scope.editAddress = function (a) {
    var model = {};
    angular.copy(a, model);
    $scope.addressManagementModal = {
      isNewAddress: false,
      address: model,
    };
    $('#addressManagementModal').foundation('reveal', 'open');
  };


  $scope.newAddress = function () {
    $scope.addressManagementModal = {
      isNewAddress: true,
      address: {
        addressType: $scope.tab,
        addresses: [""],
        category: '-1',
        subCategory: '-1',
      },
      categories: [],
      subCategories: [],
    };
    $scope.setupSelectionCategories();
    $scope.updateSubCategories();
    if ($scope.addressManagementModal.address.addressType === 'ISSUES' ||
      $scope.addressManagementModal.address.addressType === 'FAULT') {
      $scope.$watch('addressManagementModal.address.category', function () {
        $scope.updateSubCategories();
      });
    }
    $('#addressManagementModal').foundation('reveal', 'open');
  };

  $scope.addEmailAddress = function () {
    $scope.addressManagementModal.address.addresses.push("");
  };

  $scope.removeEmailAddress = function (index) {
    // browser compatibility
    var addresses = $scope.addressManagementModal.address.addresses;
    $scope.addressManagementModal.address.addresses = [];
    angular.forEach(addresses, function (v, a) {
      if (a == index) {
        return;
      }
      $scope.addressManagementModal.address.addresses.push(v);
    });
  };

  $scope.cancelModal = function () {
    $('#addressManagementModal').foundation('reveal', 'close');
    $scope.addressManagementModal = {};
  };

  $scope.setupSelectionCategories = function () {
    var cats = [{ value: '-1', name: $translate('addressManagement.selectCategories.placeholder'), disabled: true }];
    angular.forEach($scope.categories, function (v, d) {
      cats.push({ value: v.id, name: v.title_en });
    });
    $scope.addressManagementModal.categories = cats;

    var faultCats = [{
      value: '-1',
      name: $translate('addressManagement.selectCategories.placeholder'),
      disabled: true,
    }];
    angular.forEach($scope.faultCategories, function (v, d) {
      faultCats.push({ value: v.id, name: v.title_en });
    });
    $scope.addressManagementModal.faultCategories = faultCats;
  };

  $scope.updateSubCategories = function () {
    if ($scope.addressManagementModal === undefined || $scope.addressManagementModal.address === undefined) {
      return;
    }
    var cats = [{ value: '-1', name: $translate('addressManagement.selectSubCategories.placeholder'), disabled: true }];
    var faultCats = [{
      value: '-1',
      name: $translate('addressManagement.selectSubCategories.placeholder'),
      disabled: true,
    }];
    if ($scope.addressManagementModal.address.category == '-1') {
      $scope.addressManagementModal.address.subCategory = '-1';
      $scope.addressManagementModal.subCategories = cats;
      $scope.addressManagementModal.faultSubCategories = faultCats;
      return;
    }
    angular.forEach($scope.categories, function (cv, c) {
      if ($scope.addressManagementModal.address === undefined || cv.id != $scope.addressManagementModal.address.category) {
        return;
      }
      angular.forEach(cv.subCategories, function (sv, s) {
        cats.push({ value: sv['id'], name: sv.title_en });
      });
    });
    angular.forEach($scope.faultCategories, function (cv, c) {
      if ($scope.addressManagementModal.address === undefined || cv.id != $scope.addressManagementModal.address.category) {
        return;
      }
      angular.forEach(cv.subCategories, function (sv, s) {
        faultCats.push({ value: sv['id'], name: sv.title_en });
      });
    });
    $scope.addressManagementModal.address.subCategory = '-1';
    $scope.addressManagementModal.subCategories = cats;
    $scope.addressManagementModal.faultSubCategories = faultCats;
  };

  $scope.resetErrors = function () {
    $scope.isValidationError = false;
    $scope.isGenericError = false;
    $scope.addressManagementModal.isValidationError = false;
    $scope.addressManagementModal.isGenericError = false;
    $scope.addressManagementModal.errors = {};
    $scope.addressAdded = false;
    $scope.addressUpdated = false;
  };
}]);
