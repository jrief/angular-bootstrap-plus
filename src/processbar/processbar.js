(function() {
'use strict';

var module = angular.module('bs-plus.processbar', []);

module.directive('bspProcessBar', ['$compile', '$templateCache', function($compile, $templateCache) {
	return {
		restrict: 'E',
		scope: true,
		require: 'bspProcessBar',
		controller: function($scope) {
			var self = this;

			$scope.selectStep = function(step) {
				console.log(step);
				if (step.enabled) {
					$scope.activeStep = step;
					self.hideStepElements();
				}
			};

			$scope.stepButtonClass = function(step) {
				var classes = [];
				if (step.enabled && step.validated) {
					classes.push('btn-primary');
				} else {
					classes.push('btn-default');
				}
				if ($scope.activeStep === step) {
					classes.push('active');
				}
				return classes;
			};

			$scope.stepButtonDisabled = function(step) {
				return ($scope.activeStep !== step && !step.enabled);
			};

			this.hideStepElements = function() {
				var k, step;
				for (k = 0; k < $scope.bspProcessSteps.length; k++) {
					step = $scope.bspProcessSteps[k];
					if (step === $scope.activeStep) {
						step.element.removeClass('ng-hide');
					} else {
						step.element.addClass('ng-hide');
					}
				}
			};

			this.enableStepElements = function() {
				var k, enabled = true, step;
				for (k = 0; k < $scope.bspProcessSteps.length; k++) {
					step = $scope.bspProcessSteps[k];
					step.enabled = enabled;
					enabled = enabled && step.validated;
				}
			};
		},
		link: {
			pre: function(scope, element, attrs) {
				console.log(scope);
				// keep the validation state of each child form of this element
				scope.bspProcessSteps = [];
			},
			post: function(scope, element, attrs, controller) {
				var k, step;
				// add the process bar just below <bsp-process-bar>
				$compile($templateCache.get('bsp/process-bar.html'))(scope, function(clonedElement, scope) {
					element.prepend(clonedElement);
				});
				scope.activeStep = scope.bspProcessSteps[0];
				for (k = 0; k < scope.bspProcessSteps.length; k++) {
					step = scope.bspProcessSteps[k];
					if (step.validated) {
						scope.activeStep = step;
					}
				}
				controller.enableStepElements();
				controller.hideStepElements();
			}
		}
	};
}]);


module.directive('bspProcessStep', ['$q', function($q) {
	return {
		restrict: 'E',
		require: ['^bspProcessBar', 'bspProcessStep'],
		scope: true,
		controller: function($scope) {
			// check each child form's validation and reduce it to one single state
			var self = this;

			this.findProcessStep = function($id) {
				for (var k = 0; k < $scope.$parent.bspProcessSteps.length; k++) {
					if ($scope.$parent.bspProcessSteps[k].$id == $id)
						return $scope.$parent.bspProcessSteps[k];
				}
				throw new Error("Process step with $id=" + $id + " does not exist");
			};

			this.reduceValidation = function(formId, formIsValid) {
				console.log('reduceValidation: ' + formId + ' = ' + formIsValid);
				$scope.bspValidatedForms[formId] = formIsValid;
				$scope.stepIsValid = true;
				angular.forEach($scope.bspValidatedForms, function(validatedForm) {
					$scope.stepIsValid = $scope.stepIsValid && validatedForm;
				});
				console.log($scope.bspValidatedForms);  console.log('stepIsValid = ' + $scope.stepIsValid);
				self.findProcessStep($scope.$id).validated = $scope.stepIsValid;
				console.log($scope.$parent.bspProcessSteps);
			};
		},
		link: {
			pre: function(scope, element, attrs, controllers) {
				// to start with, add any value to the validation list
				scope.$parent.bspProcessSteps.push({
					$id: scope.$id,
					validated: false,
					title: attrs.title,
					element: element,
					enabled: false
				});
				// a map of booleans keeping the validation state for each of the child forms
				scope.bspValidatedForms = {};
			},
			post: function(scope, element, attrs, controllers) {
				console.log(scope);
				scope.nextStep = function(promise) {
					var k;
					for (k = 0; k < scope.bspProcessSteps.length; k++) {
						if (scope.bspProcessSteps[k] === scope.$parent.activeStep)
							break;
					}
					$q.when(promise).then(function(result) {
						console.log(result);
						if (k < scope.$parent.bspProcessSteps.length - 1) {
							scope.$parent.activeStep = scope.$parent.bspProcessSteps[k + 1];
							controllers[0].enableStepElements();
							controllers[0].hideStepElements();
						}
					}, function(error) {
						console.error(error);
					});
				};
			}
		}
	};
}]);


module.directive('form', ['$timeout', function($timeout) {
	function toBoolean(value) {
		var v;
		if (value && value.length !== 0) {
			v = angular.lowercase("" + value);
			value = !(v == 'f' || v == '0' || v == 'false' || v == 'no' || v == 'n' || v == '[]');
		} else {
			value = false;
		}
		return value;
	}

	return {
		restrict: 'E',
		require: ['^?bspProcessStep', 'form'],
		priority: 1,
		scope: {},
		link: function(scope, element, attrs, controllers) {
			console.log(scope);
			console.log(controllers);
			if (!controllers[0])
				return;  // not for forms outside a <bsp-process-step></bsp-process-step>

			element.on('change', function() {
				console.log('changed');
				scope.$apply(function() {
					controllers[0].reduceValidation(scope.$id, controllers[1].$valid);
				});
				//scope.$parent.$apply();
			});

			// delay first evaluation until form is fully validated
			$timeout(function() {
				console.log(controllers[1].$valid); 
				controllers[0].reduceValidation(scope.$id, controllers[1].$valid);
			});
		}
	};
}]);


})();
