(function() {
'use strict';

var module = angular.module('bs-plus.scrollpanel', []);

module.directive('bspScrollpanel', ['$timeout', '$window', function($timeout, $window) {
	return {
		transclude: true,
		templateUrl: 'scrollpanel/bsp-scrollpanel.tmpl.html',
		link: function(scope, element, attrs) {
			var child, delta, maxOffset, offset, initial, margin;

			function setDefaults() {
				maxOffset = child.scrollWidth - child.offsetWidth;
				offset = maxOffset * initial;
				delta = child.offsetWidth / 3;
				$timeout(setOffset, 250);
			}

			function setOffset() {
				offset = Number.isNaN(offset) ? -margin : Math.min(Math.max(offset, -margin), maxOffset);
				angular.element(child).css('margin-left', -offset + 'px');
			}

			child = element.children('ng-transclude').children();
			if (child.length !== 3)
				throw new Error("A 'bsp-scrollpanel' directive may contain only one element");
			child = child[1];
			initial = attrs.initialPercentage / 100;
			margin = child.offsetLeft;

			angular.element($window).on('resize load', setDefaults);

			element.find('panel-control').on('click', function(event) {
				var classes = event.target.getAttribute('class');
				if (classes.indexOf('left') >= 0) {
					offset -= delta;
				} else if (classes.indexOf('right') >= 0) {
					offset += delta;
				}
				offset = Math.min(Math.max(offset, -margin-25), maxOffset+25);
				angular.element(child).css('margin-left', -offset + 'px');
				$timeout(setOffset, 250);
			});

		}
	}
}]);

})();
