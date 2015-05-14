angular.module('ChatApp')
.factory('Conversation', ['$resource', function($resource) {
    return $resource('/conversation/:id', {}, {
	    update: {
	      method: 'PUT' // this method issues a PUT request
	    }
	});
}]);