angular.module('ChatApp')
.controller('LoginController', ['$rootScope','$scope', 'Auth', function($rootScope, $scope, Auth) {
  $scope.login = function() {
    Auth.login({
      email: $scope.email,
      password: $scope.password
    });
  };
}]);
