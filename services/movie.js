angular.module('CRUDApp').factory('Movie', function($resource) {
  return $resource('http://localhost/weblab/movie/:id', {}, {
    update: {
      method: 'PUT' // this method issues a PUT request
    }
  });
});