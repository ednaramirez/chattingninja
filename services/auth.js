angular.module('ChatApp')
.factory('Auth', ['$http', '$state', '$rootScope', '$cookies', 'ConnectedUsers',
  function($http, $state, $rootScope, $cookies, ConnectedUsers) {
    $rootScope.onCurrent = false;
    if($cookies['user']){
       $rootScope.currentUser = JSON.parse($cookies['user']);
    }  
    
    //console.log($cookies['user']);
    //$cookieStore.remove('user');

    return {
      login: function(user) {
        $http.post('/login', user)
        .success(function(data) {
          $state.go('chat.current'); 
          $rootScope.currentUser = data;
          $rootScope.currentUser.birthdate = new Date($rootScope.currentUser.birthdate);
          //createPeer();
        })
      },
      signup: function(user) {
        return $http.post('/user', user)
        .success(function(data) {
          $state.go('chat');
          $rootScope.currentUser = data;
        })
      },
      logout: function() {
        return $http.get('/logout').success(function() {
          $rootScope.currentUser = null;
          $cookies['user']=null;
          $rootScope.peer.destroy();
        });
      }
      
    };
  }]);
