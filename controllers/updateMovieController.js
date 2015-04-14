angular.module('CRUDApp')
.controller('UpdateMovieController', ['$scope', 'Movie', '$routeParams', '$location' , function($scope, Movie, $routeParams, $location) {
  	$scope.movie = Movie.get({id:$routeParams.id});
  	$scope.submit = function(){
  		$scope.movie.$update(function() {
	    	$location.path('/');
	    });
  	}
}]);