(function() {
'use strict';

var module = angular.module('bs-plus.scrollpane', []);

module.directive('bspScrollPane', ['$timeout', '$window', function($timeout, $window) {
	return {
		transclude: true,
		templateUrl: 'scrollpane/bsp-scrollpane.tmpl.html',
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
				throw new Error("A 'bsp-scroll-pane' directive may contain only one element");
			child = child[1];
			initial = attrs.initialPercentage / 100;
			margin = child.offsetLeft;

			angular.element($window).bind('resize', setDefaults);
			setDefaults();

			element.find('scroll-edge').on('click', function(event) {
				switch (event.target.getAttribute('class')) {
					default:
						return;
					case 'scroll-left': case 'button-left': case 'arrow-left':
						offset -= delta;
						break;
					case 'scroll-right': case 'button-right': case 'arrow-right':
						offset += delta;
						break;
				}
				offset = Math.min(Math.max(offset, -margin-25), maxOffset+25);
				angular.element(child).css('margin-left', -offset + 'px');
				$timeout(setOffset, 250);
			});

		}
	}
}]);

})();
