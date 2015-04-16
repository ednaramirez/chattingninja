angular.module('ChatApp', ['ngResource', 'ngRoute', 'angularFileUpload'])
	.config(function($locationProvider, $routeProvider){
		$locationProvider.html5Mode(true);
		$routeProvider
		.when('/', {
			templateUrl: 'views/home.html',
			controller: 'HomeController'
		});
	})
	.run(function($rootScope){
		$rootScope.peers = [];
	});