angular.module('ChatApp')
.controller('ArchivedChatController', ['$rootScope', '$scope', '$location', '$window', '$upload', '$http', 'Conversation', 'Message', 'Auth', 'ConnectedUsers', '$state', 'User', function($rootScope, $scope, $location, $window, $upload, $http, Conversation, Message, Auth, ConnectedUsers, $state, User) {
	$scope.peerFound = false;
  	$scope.archived = true;
   	setChatContainerHeight();
  	scrollToBottom();
  	$scope.conversations=[];
  	Conversation.query({user:$rootScope.currentUser._id}, function(data){
  		for (var i = data.length - 1; i >= 0; i--) {
  			var conversee;
  			var messages=[];
  			var conversation = data[i];
  				User.get({id:conversation.participantB}, function(user){
  				conversee=user;	
  				for (var j = conversation.messages.length - 1; j >= 0; j--) {
					Message.get({id: conversation.messages[j]}, function(msg){
						if(msg.user == conversee._id){
							msg.sender = conversee.name;
							if(conversee.anonymous){
								msg.sender = "Anonymous";
							}
						}
						else {
							msg.sender = "You";
						}
						messages.push(msg);
					})
				};

				$scope.conversations.push({conversee: conversee, messages, id:(i+2)});
				console.log($scope.conversations);
  			});	
			
  		};
  		
  	});
  	function setChatContainerHeight(){
    	document.getElementById('chat-container').style.height = (window.innerHeight - 150)+"px";
  	} 
  	function scrollToBottom(){
    	var objDiv = document.getElementById("conversation-container");
    	objDiv.scrollTop = objDiv.scrollHeight;
  	}
  	window.onresize = function (){
    	setChatContainerHeight()
  	}
}]);
