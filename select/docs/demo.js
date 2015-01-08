
console.log('BootstrapPlusDemo');

angular.module('BootstrapPlusDemo', ['awesome.select'])
  .controller('DummySelectDemoCtrl', function() {})
  .controller('AlertSelectDemoCtrl', function($scope) {
    $scope.browserChanged = function() {
      alert('Selected browser: ' + $scope.browser);
    };
  })
  .controller('ActivateSelectDemoCtrl', function($scope) {
    $scope.setBrowser = function(browser) {
      $scope.browser = browser;
    };
  })
  .controller('MultipleSelectDemoCtrl', function($scope) {
    $scope.toggleBrowser = function(browser) {
      var browsers = angular.copy($scope.browsers);
      var index = browsers.indexOf(browser);
      if (index >= 0) {
        browsers.splice(index, 1);
      } else {
        browsers.push(browser);
      }
      $scope.browsers = browsers;
    };
  });
