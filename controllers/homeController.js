angular.module('ChatApp')
.controller('HomeController', ['$rootScope', '$scope', '$location', '$window' , function($rootScope, $scope, $location, $window) {
 	var peer = new Peer({key: '3dlnx25329zlg14i'});
 	console.log($rootScope.peers);
 	$scope.messages=[];
 	var i=0;
 	var conn;
 	$scope.peerid="";
 	peer.on('open', function(id) {
 		$scope.$apply(function(){
 			$scope.peerid=id;
 		});
	  console.log('My peer ID is: ' + id);
	  $rootScope.peers.push(peer);
	  console.log($rootScope.peers);
	});
	peer.on('connection', connect);
	function connect(c){
		conn = c;
		console.log("Connected to "+c.peer);
		c.on('data', function(data){
			$scope.$apply(function(){
	 			$scope.messages[i++]={name:'Partner', content:data};
	 		});
			console.log(data);
			c.on('close', function(){
				console.log(c.peer + ' has left the chat');
			});
		});
	} 
	$scope.connectToPeer = function(){
		console.log("Trying to connect");
		conn = peer.connect($scope.idConnect);
		conn.on('open', function() {
		  connect(conn);
		});
		conn.on('error', function(err){
			console.log("Error "+err);
		});
	}
	$scope.sendMessage = function(){
		$scope.messages[i++]={name:'You', content:$scope.message};
		conn.send($scope.message);
		$scope.$digest();
		$scope.message="";
	}
	
}]);