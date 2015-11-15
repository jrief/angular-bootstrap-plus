// Alternative implementation of the <select> element using pure AngularJS

angular.module('bs-plus.select', ['ngSanitize'])
.directive('bspSelect', ['$window', '$compile', function($window, $compile) {
	return {
		restrict: 'E',
		transclude: true,
		templateUrl: 'select/bsp-select.tmpl.html',
		scope: {
			model: '=?ngModel',
			ngChange: '&'
		},
		controller: ['$scope', function($scope) {
			var self = this;
			$scope.isWorking = false;
			$scope.showDropdown = false;
			$scope.optionElements = [];

			$scope.renderButtonLabels = function() {
				return self.renderButtonLabels($scope.buttonLabels);
			};

			self.addCloseIcons = function(buttonLabels) {
				var k;
				for (k = 0; k < buttonLabels.length; k++) {
					if (angular.isDefined($scope.model[k])) {
						buttonLabels[k] += '<sup class="deselect btn btn-default" value="' + $scope.model[k] + '">&times;</sup>';
					}
				}
			};

			self.renderButtonLabels = function(buttonLabels) {
				var k;
				if (buttonLabels.length > 0) {
					buttonLabels = angular.copy(buttonLabels);
					if (self.deselectable) {
						self.addCloseIcons(buttonLabels);
					}
					return buttonLabels.join('<span class=sep></span>');
				}
				return $scope.emptyLabel;
			};

			self.addOptionElement = function(element) {
				$scope.optionElements.push(element);
			};

			self.deselectAll = function() {
				angular.forEach($scope.optionElements, function(elem) {
					elem.removeClass('active');
				});
			};

			self.startWorking = function() {
				$scope.isWorking = true;
			};

			self.stopWorking = function() {
				$scope.ngChange();
				// test with this: $scope.$apply($scope.ngChange);
				$scope.isWorking = false;
			};

			self.selectOption = function(optionElement) {
				if (self.isMultiple) {
					optionElement.toggleClass('active');
				} else {
					self.deselectAll();
					optionElement.addClass('active');
				}
				self.syncButton(true);
			};

			self.syncButton = function(changeModel) {
				// from the dropdown box settings, build a button whose content reflects the current state
				var values = [];
				$scope.buttonLabels = [];
				angular.forEach($scope.optionElements, function(element) {
					var acronym, value;
					if (element.hasClass('active')) {
						// add option's subelement <acronym>...</acronym> to the list of selected elements
						acronym = element.find('acronym');
						if (acronym.length > 0) {
							$scope.buttonLabels.push(acronym.html());
						} else {
							// otherwise, take the whole element's content
							$scope.buttonLabels.push(element.html());
						}
						value = element.attr('value');
						if (angular.isDefined(value)) {
							values.push(value);
						}
					}
				});
				$scope.cssClasses = $scope.isDisabled ? {disabled: 'disabled'} : {};
				if (changeModel) {
					$scope.model = self.isMultiple ? values : values.join();
				}
			};

			self.syncModel = function() {
				// from the model settings, set the dropdown box and the button state
				if (self.isMultiple) {
					angular.forEach($scope.optionElements, function(elem) {
						elem.removeClass('active');
					});
					angular.forEach($scope.optionElements, function(elem) {
						if ($scope.model.indexOf(elem.attr('value')) >= 0) {
							elem.addClass('active');
						}
					});
				} else {
					angular.forEach($scope.optionElements, function(elem) {
						elem.removeClass('active');
						if (elem.attr('value') === $scope.model) {
							elem.addClass('active');
						}
					});
				}
				self.syncButton(false);
			};

			self.closeDropdown = function() {
				$scope.showDropdown = false;
			};

			self.toggleDropdown = function($event) {
				var value, index;
				if ($event.target.tagName === 'SUP') {
					self.startWorking();
					value = angular.element($event.target).attr('value');
					angular.forEach($scope.optionElements, function(elem) {
						if (elem.attr('value') === value) {
							elem.removeClass('active');
							index = $scope.model.indexOf(value);
							if (index >= 0) {
								$scope.model.splice(index, 1);
							}
						}
					});
					self.syncButton(true);
					self.stopWorking();
				} else {
					$scope.showDropdown = !$scope.isDisabled && !$scope.showDropdown;
				}
			};

			$scope.toggleDropdown = function($event) {
				$event.stopPropagation();
				self.toggleDropdown($event);
			};

			$scope.deselectAll = function() {
				self.deselectAll();
				self.closeDropdown();
				self.syncButton(true);
			};

			$scope.filterOptions = function() {
				var lcSearchString = angular.lowercase($scope.searchString);
				if (lcSearchString.length > 0) {
					angular.forEach($scope.optionElements, function(elem) {
						var text = elem.clone();
						text.find('abbr').remove(); // since the <abbr> element doesn't show up in the dropdown box
						if (angular.lowercase(text.text()).search(lcSearchString) >= 0) {
							elem.css('display', 'block');
						} else {
							elem.css('display', 'none');
						}
					});
				} else {
					angular.forEach($scope.optionElements, function(elem) {
						elem.css('display', 'block');
					});
				}
			};

			$scope.resetFilter = function() {
				$scope.searchString = '';
				$scope.filterOptions();
			};
		}],
		controllerAs: 'self',
		link: function(scope, element, attrs, controller, transclude) {
			function addFilterInputElement() {
				// add a search field to filter options
				var filterElem;
				if (!scope.filterPlaceholder)
					return;
				filterElem = $compile(
					'<div class="filter">' +
						'<input placeholder="{{ filterPlaceholder }}" type="text" ng-change="filterOptions()" ng-model="searchString">' +
					'<button type="button" class="button reset" ng-click="resetFilter()">&times;</button>' + 
					'</div>')(scope);
				angular.forEach(element.find('div'), function(divElem) {
					if (divElem.attributes.hasOwnProperty('ng-transclude')) {
						angular.element(divElem).prepend(filterElem);
					}
				});
			}
			// need some help on transclude. Otherwise the filterElem has to be added to the DOM manually, see above.
			controller.isMultiple = attrs.hasOwnProperty('multiple');
			controller.isRequired = attrs.hasOwnProperty('required');
			controller.deselectable = controller.isMultiple && attrs.hasOwnProperty('deselectable');
			scope.name = attrs.hasOwnProperty('name') ? attrs.name : null;
			scope.emptyLabel = attrs.hasOwnProperty('emptyLabel') ? attrs.emptyLabel : '---';
			scope.model = controller.isMultiple ? [] : '';
			scope.isDisabled = attrs.hasOwnProperty('disabled');
			scope.selectNone = (attrs.hasOwnProperty('selNone') && (!controller.isRequired || controller.isMultiple)) ? attrs.selNone : false;
			scope.filterPlaceholder = attrs.hasOwnProperty('filter') ? attrs.filter : false;
			addFilterInputElement();
			scope.$watch('model', function(newValue, oldValue) {
				if (!scope.isWorking && !angular.equals(newValue, oldValue)) {
					controller.syncModel();
				}
			});
			controller.syncButton(true);
			angular.element($window).on('click', function() {
				controller.closeDropdown();
				scope.$apply();
			});
		}
	};
}])
.directive('bspOptgroup', function() {
	return {
		require: ['^bspSelect', 'bspOptgroup'],
		restrict: 'E',
		scope: {},
		controller: function($scope) {
			this.optGroupElements = [];

			this.addOptionElement = function(element) {
				this.optGroupElements.push(element);
				this.selectCtrl.addOptionElement(element);
			};

			this.selectOption = function(optionElement) {
				if (this.isSingle) {
					// deactivate all options in the same optgroup
					angular.forEach(this.optGroupElements, function(elem) {
						if (angular.equals(optionElement, elem)) {
							elem.toggleClass('active');
						} else {
							elem.removeClass('active');
						}
					});
					this.selectCtrl.syncButton(true);
				} else {
					this.selectCtrl.selectOption(optionElement);
				}
			};

			this.selectGroup = function(optionElement) {
				if (this.isSelectable) {
					var allActive = this.allActive = !this.allActive;
					// activate all options in the same optgroup
					angular.forEach(this.optGroupElements, function(elem) {
						allActive ? elem.addClass('active') : elem.removeClass('active');
					});
					this.selectCtrl.syncButton(true);
				}
			};
		},
		link: {
			pre: function(scope, element, attrs, controllers) {
				controllers[1].selectCtrl = controllers[0];
			},
			post: function(scope, element, attrs, controllers) {
				var controller = controllers[1];
				controller.isSingle = attrs.hasOwnProperty('single');
				controller.isSelectable = attrs.hasOwnProperty('selectable');
				controller.allActive = false;
				if (controller.isSelectable) {
					element.addClass('selectable');
				}
				element.on('click', function($event) {
					var optgroupElement = angular.element($event.target);
					controller.selectCtrl.startWorking();
					controller.selectGroup(optgroupElement);
					scope.$apply();
					controller.selectCtrl.stopWorking();
				});
			}
		}
	};
})
.directive('bspOption', function() {
	return {
		require: ['^bspSelect', '?^bspOptgroup'],
		restrict: 'E',
		scope: {},
		link: function(scope, element, attrs, controllers) {
			var selectCtrl = controllers[0],
				parentCtrl = angular.isDefined(controllers[1]) ? controllers[1] : controllers[0],
				isDisabled = attrs.hasOwnProperty('disabled');

			parentCtrl.addOptionElement(element);
			if (attrs.hasOwnProperty('selected')) {
				element.addClass('active');
			}
			if (isDisabled) {
				element.addClass('disabled');
			}
			element.on('click', function($event) {
				$event.stopPropagation();  // prevents to trigger wrapping handlers
				if (isDisabled)
					return;
				selectCtrl.startWorking();
				parentCtrl.selectOption(angular.element(this));
				if (!selectCtrl.isMultiple) {
					selectCtrl.closeDropdown();
				}
				scope.$apply();
				selectCtrl.stopWorking();
			});
		}
	};
});

(function(angular, undefined) {
	'use strict';
})(window.angular);
