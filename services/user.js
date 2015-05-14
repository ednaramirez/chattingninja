angular.module('ChatApp')
.factory('User', ['$resource', function($resource) {
    return $resource('/user/:id', {}, {
	    update: {
	      method: 'PUT' // this method issues a PUT request
	    }
	});
}]);