(function() {
'use strict';

var module = angular.module('bs-plus.processbar', []);

module.provider('processBar', function() {
	var self = this;
	this.activeStep = 'btn-primary active';
	this.validatedStep = 'btn-success';
	this.untouchedStep = 'btn-default';

	this.$get = function() {
		return self;
	};

	this.setButtonClasses = function(activeStep, validatedStep, untouchedStep) {
		this.activeStep = activeStep;
		this.validatedStep = validatedStep;
		this.untouchedStep = untouchedStep;
	};
});

	
module.directive('bspProcessBar', ['$compile', '$templateCache', 'processBar', function($compile, $templateCache, processBar) {
	return {
		restrict: 'E',
		scope: true,
		require: 'bspProcessBar',
		controller: function($scope) {
			$scope.selectStep = function(step) {
				if (step.enabled) {
					$scope.activeStep = step;
				}
			};

			$scope.stepButtonClass = function(step) {
				if ($scope.activeStep === step) {
					return processBar.activeStep;
				} else if (step.validated || step.enabled) {
					return processBar.validatedStep;
				} else {
					return processBar.untouchedStep;
				}
			};

			$scope.stepButtonDisabled = function(step) {
				return !step.enabled;
			};
		},
		link: {
			pre: function(scope, element, attrs) {
				// keep the validation state of each child form of this element
				scope.bspProcessSteps = [];
				scope.activeStep = {'$id': null};
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
			}
		}
	};
}]);


module.directive('bspProcessStep', ['$q', function($q) {
	return {
		restrict: 'E',
		require: '^bspProcessBar',
		scope: true,
		link: {
			pre: function(scope, element, attrs) {
				// to start with, add any value to the validation list
				scope.$parent.bspProcessSteps.push({
					$id: scope.$id,
					validated: false,
					title: attrs.title,
					enabled: false
				});
			},
			post: function(scope, element, attrs, controller) {
				scope.stepIsActive = function() {
					return scope.$parent.activeStep.$id === scope.$id;
				};

				scope.nextStep = function(promise) {
					var k;
					for (k = 0; k < scope.bspProcessSteps.length; k++) {
						if (scope.bspProcessSteps[k] === scope.$parent.activeStep)
							break;
					}
					$q.when(promise).then(function(response) {
						scope.$parent.bspProcessSteps[k].validated = true;
						if (k < scope.$parent.bspProcessSteps.length - 1) {
							scope.$parent.activeStep = scope.$parent.bspProcessSteps[k + 1];
							scope.$parent.bspProcessSteps[k + 1].enabled = true;
						}
					}).catch(function(response) {
						scope.$parent.bspProcessSteps[k].validated = false;
						console.error(response);
					});
				};

				// the first step is enabled by default
				scope.$parent.bspProcessSteps[0].enabled = true;
			}
		}
	};
}]);


})();
