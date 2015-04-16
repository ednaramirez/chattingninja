angular.module('ChatApp')
.controller('HomeController', ['$rootScope', '$scope', '$location', '$window', '$upload', '$http', function($rootScope, $scope, $location, $window, $upload, $http) {
 	var peer = new Peer({key: '3dlnx25329zlg14i'});
 	console.log($rootScope.peers);
 	$scope.messages=[];
  $scope.camera = false;
  var localStream;
 	var i=0;
 	var conn;
 	$scope.onFileSelect = function($files) {
  		$scope.picture = $files[0];
  		console.log($files[0]);
  	}	
  	var ID = function () {
	  // Math.random should be unique because of its seeding algorithm.
	  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
	  // after the decimal.
	  return '_' + Math.random().toString(36).substr(2, 9);
	};
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
	 			$scope.messages[i++]={name:'Partner', content:data.content, type:data.type};
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
		$scope.messages[i++]={name:'You', content:$scope.message, type: 'text'};
		var data = {content: $scope.message, type: 'text'};
		conn.send(data);
		//$scope.$digest();
		$scope.message="";
	}
	$scope.sendImage = function(){
		var id = ID();
		var imageExtension = $scope.picture.name.substr($scope.picture.name.lastIndexOf("."));
		$upload.upload({
          	url: 'upload', //upload.php script, node.js route, or servlet url
          	method: 'POST',
          	//headers: {'header-key': 'header-value'},
          	//withCredentials: true,
          	data: id,
          	file: $scope.picture, // or list of files ($files) for html5 only
          	fileName: id+imageExtension // to modify the name of the file(s)
          	// customize file formData name ('Content-Disposition'), server side file variable name. 
          	//fileFormDataName: myFile, //or a list of names for multiple files (html5). Default is 'file' 
          	// customize how data is added to formData. See #40#issuecomment-28612000 for sample code
          	//formDataAppender: function(formData, key, val){}
        	}).progress(function(evt) {
          		console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
        	}).success(function(data, status, headers, config) {
          		// file is uploaded successfully
          		appendImage(id,imageExtension);
        	});
		
	}

  function appendImage(id, imageExtension){
    var imgUrl = "images/"+id+imageExtension;
    $scope.messages[i++]={name:'You', content:imgUrl, type: 'image'};
    var data = {content: imgUrl, type: 'image'};
    conn.send(data);
  }
  function appendAudio(id){
    var audioUrl = "media/"+id+".wav";
    $scope.messages[i++]={name:'You', content:audioUrl, type: 'audio'};
    var data = {content: audioUrl, type: 'audio'};
    conn.send(data);
  }
	window.onbeforeunload = function () {
        peer.close();
    }
    var CLIENT_ID = 'ff28f3ddd438863';
      var submitButton;
      var takeButton;
      var lastImage;
      var fullImage;
      var preview;
      var confirm;
      var cancel;
      
    $scope.sendPicture = function () {
    	var id = ID();
        $http.post("upload/"+id+".jpg", 
	        {
	        	base64: lastImage
	        }        	
        ).success(function(data){
          appendImage(id,".jpg");
        });
    }

	$scope.startCam = function () {
    navigator.getUserMedia = (navigator.getUserMedia ||
                              navigator.webkitGetUserMedia ||
                              navigator.mozGetUserMedia ||
                              navigator.msGetUserMedia);
    if (navigator.getUserMedia) {
       $scope.camera = true;
      navigator.getUserMedia({video: true, audio:false},
        function(stream) {

          localStream = stream;
          var url = window.URL || window.webkitURL;
          v.src = url ? url.createObjectURL(stream) : stream;
          v.play();
        },
        function(error) { alert('Sorry, the browser you are using doesn\'t support getUserMedia'); }
      );
    } else {
      alert('Sorry, the browser you are using doesn\'t support getUserMedia');
      return;
    }
  }
  $scope.closeCam = function () {
    v.src="";
    localStream.stop();
    localStream = null;
    $scope.camera=false;
  }

    $scope.takePicture = function(){
          var con = c.getContext('2d');
          var h = v.videoHeight;
          var w = v.videoWidth;
          c.setAttribute('width', w);
          c.setAttribute('height', h);
          // Reverse the canvas image
          con.fillRect(0, 0, w, h);
          con.drawImage(v, 0, 0, w, h);
          try {
            fullImage = c.toDataURL('image/jpeg', 0.9);

          } catch(e) {
            fullImage = c.toDataURL();
          }
          lastImage = fullImage.split(',')[1];
          $scope.fullImage=fullImage;
          console.log(fullImage);
        }
  var recordRTC;

  $scope.startRecording = function(){
    navigator.getUserMedia({audio:true, video:false}, function (mediaStream) {
        localStream = mediaStream;
        recordRTC = RecordRTC(mediaStream);
        recordRTC.startRecording();
    }, function error(error){
      console.log("Not supported");
    });
  }

  $scope.stopRecording = function(){
    recordRTC.stopRecording(function(audioURL) {
      audio.src = audioURL;
      var recordedBlob = recordRTC.getBlob();
      recordRTC.getDataURL(function(dataURL) {
        audioDataURL = dataURL;
      });
    });
    localStream.stop();
    localStream = null;
  }	
  $scope.sendAudio = function(){
    var id = ID();
    var file = {
                name: id+'.wav',
                type: 'audio/wav',
                contents: audioDataURL
              };
    $http.post("uploadAudio", 
      {
        file: file
      }         
    ).success(function(data){
      appendAudio(id);
    });
  } 
}]);