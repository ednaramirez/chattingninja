angular.module('ChatApp')
.factory('Message', ['$resource', function($resource) {
    return $resource('/message', {}, {
	    update: {
	      method: 'PUT' // this method issues a PUT request
	    }
	});
}]);