(function() {
'use strict';

var module = angular.module('bs-plus.scrollpane', []);

module.directive('bspScrollPane', ['$timeout', function($timeout) {
	return {
		transclude: true,
		templateUrl: 'scrollpane/bsp-scrollpane.tmpl.html',
		link: function(scope, element, attrs) {
			var child, delta, maxOffset, offset = 0;

			child = element.children('ng-transclude').children();
			if (child.length !== 3)
				throw new Error("A 'bsp-scroll-pane' directive may contain only one element");
			child = child[1];
			maxOffset = child.scrollWidth - child.offsetWidth;
			delta = child.offsetWidth / 3;

			element.find('div').on('click', function(event) {
				switch (event.target.getAttribute('class')) {
					default:
						return;
					case 'scroll-left': case 'button-left': case 'arrow-left':
						offset += delta;
						break;
					case 'scroll-right': case 'button-right': case 'arrow-right':
						offset -= delta;
						break;
				}
				offset = Math.min(Math.max(offset, -25), maxOffset + 25);
				angular.element(child).css('margin-left', -offset + 'px');
				$timeout(function() {
					// after a short delay, jump back
					offset = Math.min(Math.max(offset, 0), maxOffset);
					angular.element(child).css('margin-left', -offset + 'px');
				}, 500);
			});
		}
	}
}]);

})();
