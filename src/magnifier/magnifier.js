(function() {
'use strict';

angular.module('bs-plus.magnifier', [])
.directive('bspMagnify', function() {
	return {
		restrict: 'EA',
		scope: {
			imageSrc: '@'
		},
		transclude: true,
		template: '<img src="{{ imageSrc }}" class="{{ cssClass }}" />' +
		          '<div><img src="{{ imageSrc }}" /></div>',
		link: function(scope, element, attrs) {
			var imageElem = element.find('img');
			var imageRect = imageElem[0].getBoundingClientRect();
			var canvasElem = element.find('div');
			var plateElem = canvasElem.find('img');
			console.log(attrs['style']);
			scope.cssClass = attrs['class'];
			console.log(imageRect);
			element.css({position: 'relative'});
			canvasElem.css({
				position: 'absolute',
				top: 0, right: 0, bottom: 0, left: 0,
				//'background-image': 'url("' + scope.imageSrc + '")',
				//'background-repeat': 'no-repeat',
				'opacity': 0,
				overflow: 'hidden'
			});
			plateElem.css({
				position: 'absolute',
				top: 0, left: 0,
				width: imageElem.naturalWidth,
				height: imageElem.naturalHeight
			});
			canvasElem.on('mouseenter', function() {
				console.log(element);
				console.log(imageElem);
				canvasElem.css('opacity', 1);
			}).on('mousemove', function(evt) {
				//console.log('mousemove: ' + evt.offsetX + ', ' + evt.offsetY);
				var posX = imageRect.left - evt.pageX; //imageElem[0].naturalWidth / imageElem[0].clientWidth;
				var posY = imageRect.top - evt.pageY; //imageElem[0].naturalHeight / imageElem[0].clientHeight;
				console.log('mousemove: ' + posX + ', ' + posY);
				//plateElem.css('background-position', posX + 'px ' + posY + 'px');
				//plateElem.css('background-position', posX + 'px ' + posY + 'px');
				plateElem.css({top: posY + 'px ', left: posX + 'px'});
			}).on('mouseout', function () {
				console.log('mouseout');
				canvasElem.css('opacity', 0);
			});
		}
	};
});

})();
