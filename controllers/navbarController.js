angular.module('ChatApp')
  .controller('NavbarController', ['$scope', 'Auth', function($scope, Auth) {
    
    $scope.logout = function() {
      Auth.logout();
    };
  }]);
