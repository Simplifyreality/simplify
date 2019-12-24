angular.module('tmweb').directive('formSelect', function(){
  return {
	replace: true,
    restrict:'A',
	scope: {
		selectValues : "=" ,
		ngModel:"=",
		name:"=",
    },
    templateUrl: 'templates/form-select.html',
    link: function(scope, elem, attr) {
	  $(elem).find("select").bind("DOMSubtreeModified", function() {
	      Foundation.libs.forms.refresh_custom_select($(this), true);
	  });
      scope.$watch('selectValues', function(newValue, oldValue) {
          Foundation.libs.forms.refresh_custom_select($(elem).find('select'), true);
      });
    }
  }
}).directive('optionsDisabled', function($parse) {
    var disableOptions = function(scope, attr, element, data, fnDisableIfTrue) {
        // refresh the disabled options in the select element.
        $("option[value!='?']", element).each(function(i, e) {
            var locals = {};
            locals[attr] = data[i];
            $(this).attr("disabled", fnDisableIfTrue(scope, locals));
        });
    };
    return {
        priority: 0,
        restrict:'A',
        require: 'ngModel',
        link: function(scope, iElement, iAttrs, ctrl) {
            // parse expression and build array of disabled options
            var expElements = iAttrs.optionsDisabled.match(/^\s*(.+)\s+for\s+(.+)\s+in\s+(.+)?\s*/);
            var attrToWatch = expElements[3];
            var fnDisableIfTrue = $parse(expElements[1]);
            // handle model updates properly
            scope.$watch(iAttrs.ngModel, function(newValue, oldValue) {
                var disOptions = $parse(attrToWatch)(scope);
                if(newValue) {
                    disableOptions(scope, expElements[2], iElement, disOptions, fnDisableIfTrue);
                }
            });
        }
    };
});