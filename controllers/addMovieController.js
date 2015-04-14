angular.module('CRUDApp')
.controller('AddMovieController', ['$scope', 'Movie', '$location', function($scope, Movie, $location) {
  	$scope.movie = new Movie();
  	$scope.submit = function(){
  		$scope.movie.$save(function() {
	    	$location.path('/');
	    });
  	}
}]);