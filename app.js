angular.module('ChatApp', ['ngCookies', 'ngMessages', 'ngResource', 'ui.router', 'angularFileUpload', 'ngTagsInput'])
	.config(function($locationProvider, $stateProvider){
		$locationProvider.html5Mode(true);
		$stateProvider
	    .state('main', {
	      url: "/",
	      templateUrl: "views/main.html",
	      controller: 'MainController'
	    })
	    .state('chat', {
	      url: "/chat",
	      templateUrl: "views/main.html",
	      controller: 'MainController'
	    })
	    .state('chat.current', {
	    	url: '/current',
	    	templateUrl:'views/chatWindow.html',
	    	controller: 'CurrentChatController'
	    })
	    .state('archived', {
	    	url: '/chat/archived',
	    	templateUrl:'views/archivedChatWindow.html',
	    	controller: 'ArchivedChatController'
	    })
	    .state('login', {
	      url: "/login",
	      templateUrl: "views/login.html",
	      controller: 'LoginController'
	    })
	    .state('signup', {
	      url: "/signup",
	      templateUrl: "views/account.html",
	      controller: 'AccountController'
	    })
	    .state('account', {
	      url: "/account",
	      templateUrl: "views/account.html",
	      controller: 'AccountController'
	    });
	})
	.run(function($rootScope, $location, $state, ConnectedUsers){
		$rootScope.$on('$stateChangeStart', 
		function(event, toState, toParams, fromState, fromParams){ 
			console.log(toState);
			if(toState.name!='chat.current'){
				if($rootScope.currentUser){
					var user = ConnectedUsers.delete({id: $rootScope.peer.id});
					$rootScope.peer.destroy();
				}				
			}
			else {
				if($rootScope.currentUser || fromState.name == 'login'){
			      if(!$rootScope.peer){
			        console.log("No peer found");
			        createPeer();
			      }
			    } 
			    function createPeer(){
			      $rootScope.peer = new Peer({key: '3dlnx25329zlg14i'});
			      $rootScope.peer.on('open', function(id) {
			        console.log("Peer opened");

			        var user = ConnectedUsers.save({peer: id, id: $rootScope.currentUser._id});
			      });
			    }
			}
			
		})
		/*$rootScope.$on( "$stateChangeStart", function(event, next, current) {
	      	if ($rootScope.currentUser) {

	      		var path = $route.routes[$location.path()];
	      		//console.log(path);
	        	if(path.originalPath=='/login'){
	        		$location.path("/chat");
	        	}
	      	}
	    });*/
	});