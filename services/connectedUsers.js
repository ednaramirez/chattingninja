angular.module('ChatApp')
.factory('ConnectedUsers', ['$resource', function($resource) {
    return $resource('/connectedUsers/:id', {}, {
	    update: {
	      method: 'PUT' // this method issues a PUT request
	    }
	});
}]);