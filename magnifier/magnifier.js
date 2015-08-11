(function() {
'use strict';

angular.module('bs-plus.magnifier', [])
.directive('bspMagnify', function() {
	return {
		restrict: 'EA',
		scope: {
			imageSrc: '@'
		},
		template: '<img src="{{ imageSrc }}" class="{{ cssClass }}" />' +
		          '<div class="{{ cssClass }}"><span></span></div>',
		link: function(scope, element, attrs) {
			var canvasElem = element.find('div');
			var plateElem = canvasElem.find('span');
			var magnify;
			scope.cssClass = attrs['class'];
			element.css({
				position: 'relative',
				'max-width': '100%',
				height: 'auto',
				display: 'inline-block'
			}).removeClass(scope.cssClass);
			canvasElem.css({
				opacity: 0,
				position: 'absolute',
				top: 0, right: 0, bottom: 0, left: 0,
				overflow: 'hidden',
				cursor: 'crosshair'
			});
			plateElem.css({
				width: '100%',
				height: '100%',
				display: 'inline-block'
			});
			canvasElem.on('mouseenter', function() {
				var imageElem = element.find('img');
				canvasElem.css('opacity', 1);
				plateElem.css('background-image', 'url("' + scope.imageSrc + '")');
				magnify = {
					byX: (imageElem[0].naturalWidth - imageElem[0].clientWidth) / imageElem[0].clientWidth,
					byY: (imageElem[0].naturalHeight - imageElem[0].clientHeight) / imageElem[0].clientHeight
				};
			});
			plateElem.on('mousemove', function(evt) {
				var posX = -evt.offsetX * magnify.byX;
				var posY = -evt.offsetY * magnify.byY;
				plateElem.css('background-position', posX + 'px ' + posY + 'px');
			}).on('mouseout', function () {
				canvasElem.css('opacity', 0);
			});
		}
	};
});

})();
