angular.module('ChatApp')
.controller('CurrentChatController', ['$rootScope', '$scope', '$location', '$window', '$upload', '$http', 'Conversation', 'Message', 'Auth', 'ConnectedUsers', '$state', 'User', function($rootScope, $scope, $location, $window, $upload, $http, Conversation, Message, Auth, ConnectedUsers, $state, User) {
	$scope.archived = false;
  if($rootScope.peer){
    var peer = $rootScope.peer;
   
    $scope.messages=[];
    $scope.camera = false;
    $scope.partner = {};
    var localStream;
    var i=0;
    var conn;
    
    peer.on('connection', connect);
  }
  
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
  $scope.findPeer = function (){
    connectToPeer();
  } 
  function connect(c){
    ConnectedUsers.update({id: $rootScope.peer.id, busy: true});
    $scope.$apply(function(){
      $scope.peerFound = true;
    });   
    conn = c;
    ConnectedUsers.get({id: c.peer}, function(data){
      $scope.partner = data;
      console.log($scope.partner);
    })
    console.log("Connected to "+c.peer);
    c.on('close', function(){
      console.log($rootScope.peer.id);
      ConnectedUsers.update({id: $rootScope.peer.id, busy: false});
      console.log(c.peer + ' has left the chat');
      $scope.$apply(function(){
        console.log($scope.toSave);
        if($scope.toSave){
          saveConversation($scope.messages);
          $scope.toSave = false;
        }
        $scope.partner = {};
        $scope.peerFound = false;
        $scope.messages = [];
        i=0;
      });
    });
    c.on('data', function(data){
      $scope.$apply(function(){
        var name;
        if($scope.partner.name!=null && !$scope.partner.anonymous)
        {
          name = $scope.partner.name;
        }
        else{
          name = "Partner";
        }
        $scope.messages[i++]={name:name, content:data.content, type:data.type, id:$scope.partner._id, date: new Date()};
      });
      console.log(data);

    });
  } 
  function saveConversation(messages){
    var conversation;
    $http.post('/conversation', {participantA: $rootScope.currentUser._id, participantB: $scope.partner._id})
    .success(function(data){
      conversation = data;
      for (var j = messages.length - 1; j >= 0; j--) {
        var msg = messages[j];
        console.log(msg);
        msg.conversation = conversation;
        $http.post('/message', msg);
      };
    });
  }
  function connectToPeer(){
    ConnectedUsers.query({}, function(data){
      for(var i=0;i<data.length;i++){
        if(data[i].peer!=$rootScope.peer.id && data[i].user != $rootScope.currentUser._id){
          console.log("Trying to connect");
          conn = peer.connect(data[i].peer);
          console.log(data[i]);

            conn.on('open', function() {
              connect(conn);

            });
          
          conn.on('error', function(err){
            console.log("Error "+err);
          });
          if($scope.peerFound){
            break;
          }
        }
      }
      

    });

  }
  sendMessage = function(){
    if($scope.message!=''){
      $scope.messages[i++]={name:'You', content:$scope.message, type: 'text', id:$rootScope.currentUser._id, date: new Date()};
      var data = {content: $scope.message, type: 'text'};
      $scope.message="";
      conn.send(data);
      //$scope.$digest();
      
    }
  }
  function sendImage(){
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
    $scope.messages[i++]={name:'You', content:imgUrl, type: 'image', id:$rootScope.currentUser._id, date: new Date()};
    var data = {content: imgUrl, type: 'image'};
    conn.send(data);
  }
  function appendAudio(id){
    var audioUrl = "media/"+id+".wav";
    $scope.messages[i++]={name:'You', content:audioUrl, type: 'audio', id:$rootScope.currentUser._id, date: new Date()};
    var data = {content: audioUrl, type: 'audio'};
    conn.send(data);
  }
  window.onbeforeunload = function () {
    if($scope.toSave){
      saveConversation();
      $scope.toSave = false;
    }
    var user = ConnectedUsers.delete({id: $rootScope.peer.id});
        peer.destroy();
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

  startCam = function () {
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
  closeCam = function () {
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
  console.log($rootScope.currentUser);
  setChatContainerHeight();
  scrollToBottom();
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
  $scope.setModal = function(type){
    if(type=='camera'){
      $scope.modal = type;
      $scope.modalTitle = "Take picture";
      startCam();
    } 
    else if(type=='audio'){
      $scope.modal = type;
      $scope.modalTitle = "Send audio recording";
    }
  }
  $('#myModal').on('hidden.bs.modal', function (e) {
    if($scope.modal == 'camera'){
      closeCam();
    }
  })
  $("textarea").keyup(function(e){
    var code = (e.keyCode ? e.keyCode : e.which);
    if(code == 13) { //Enter keycode
      if(conn){
        if($scope.picture){
          console.log("Picture loaded");
          $scope.$apply(sendImage);
        }
        else {
          $scope.$apply(sendMessage);
        }
        
        scrollToBottom();
      }
      else {
        $scope.$apply(function(){
          $scope.message="";
        });
      }
    }
  });
}]);
