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
		          '<div class="{{ cssClass }}"><span></span></div>',
		link: function(scope, element, attrs) {
			var imageElem = element.find('img');
			var canvasElem = element.find('div');
			var plateElem = canvasElem.find('span');
			var magnify;
			console.log(attrs['style']);
			scope.cssClass = attrs['class'];
			element.css({position: 'relative'});
			canvasElem.css({
				opacity: 0,
				//overflow: 'hidden',
				width: '100%',
				height: '100%'
				//transition: 'none'
			});
			plateElem.css({
				position: 'absolute',
				top: 0, right: 0, bottom: 0, left: 0,
				'background-repeat': 'no-repeat'
			});
			element.on('mouseenter', function() {
				console.log(element);
				canvasElem.css('opacity', 1);
				plateElem.css('background-image', 'url("' + scope.imageSrc + '")');
				magnify = {
					byX: (imageElem[0].naturalWidth - imageElem[0].clientWidth) / imageElem[0].clientWidth,
					byY: (imageElem[0].naturalHeight - imageElem[0].clientHeight) / imageElem[0].clientHeight
				};
			});
			canvasElem.on('mousemove', function(evt) {
				//return;
				//console.log('mousemove: ' + evt.offsetX + ', ' + evt.offsetY);
				//var posX = imageRect.left - evt.pageX; // / imageElem[0].clientWidth;
				//var posY = imageRect.top - evt.pageY; //imageElem[0].naturalHeight / imageElem[0].clientHeight;
				var posX = -evt.offsetX * magnify.byX; //imageElem[0].naturalWidth / imageElem[0].clientWidth;
				var posY = -evt.offsetY * magnify.byY; //imageElem[0].naturalHeight / imageElem[0].clientHeight;
				console.log('mousemove: ' + posX + ', ' + posY);
				plateElem.css('background-position', posX + 'px ' + posY + 'px');
				//canvasElem.css('background-position', posX + 'px ' + posY + 'px');
				//plateElem.css({top: posY + 'px ', left: posX + 'px'});
			}).on('mouseout', function () {
				console.log('mouseout');
				canvasElem.css('opacity', 0);
			});
		}
	};
});

})();
