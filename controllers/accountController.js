angular.module('ChatApp')
.controller('AccountController', ['$rootScope','$scope', 'Auth', '$http', 'User', '$state', function($rootScope, $scope, Auth, $http, User, $state) {
	$http.get('https://restcountries.eu/rest/').success(function(data){
		$scope.countries = data;
	});
	if($rootScope.currentUser){
		$scope.user = User.get({id:$rootScope.currentUser._id}, function(){
			$scope.user.birthdate = new Date($scope.user.birthdate);
			$scope.user.password = "";
			$scope.required = false;
			$scope.user.oldPassword = null;
			$scope.user.interests = '';
			$("#password").attr('required',$scope.required);
			$("#confirmPassword").attr('required',$scope.required);
		});
		

	}
	else {
		$scope.required = true;
		$scope.user = {};
		$scope.user.anonymous = false;
		$scope.user.love = false;
		$scope.user.friends = false;
		$scope.user.country = "United States";
		
	}
	$scope.toggleValue = function(checkbox){
		if(checkbox){
			checkbox = false;
		}
		else {
			checkbox = true;
		}
	}
	$scope.signup = function(){
		Auth.signup($scope.user);
	}
	$scope.saveChanges = function(){
		$scope.user.$update(function(){
			$state.go('chat');
		});
	}
}]);
