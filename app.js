angular.module('ChatApp', ['ngResource', 'ngRoute'])
	.config(function($routeProvider){
		$routeProvider
		.when('/', {
			templateUrl: 'views/home.html',
			controller: 'HomeController'
		});
	})
	.run(function($rootScope){
		$rootScope.peers = [];
	});