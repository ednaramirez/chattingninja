var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flow = require('flow')('images');
var formidable = require('formidable');
var fs   = require('fs-extra');
var util = require('util');
var base64image = require('base64-image');
var app = express();
var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcryptjs');

var userSchema =  new mongoose.Schema({
          email: {type: String, unique: true},
          name: String,
          interests: [{type: String}],
          gender: String,
          anonymous: Boolean,
          birthdate: Date,
          password: String,
          picture: String,
          friends: Boolean,
          country: String,
          love: Boolean
        });

var conversationSchema =  new mongoose.Schema({
              participantA: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
              participantB: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
              messages: [{type: mongoose.Schema.Types.ObjectId, ref: 'Message'}]
            });

var messageSchema =  new mongoose.Schema({
            user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
            date: Date,
            content: String,
            type: String
          });
var connectedUserSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  peer: String,
  busy: Boolean
});
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) next();
  else res.send(401);
}
userSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) return next();
  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};
var User = mongoose.model('User', userSchema);
var Message = mongoose.model('Message', messageSchema);
var Conversation = mongoose.model('Conversation', conversationSchema);
var ConnectedUser = mongoose.model('ConnectedUser', connectedUserSchema);
mongoose.connect('localhost');

passport.serializeUser(function(user, done){
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
passport.use(new LocalStrategy({ usernameField: 'email' }, function(email, password, done) {
  User.findOne({ email: email }, function(err, user) {
    if (err) return done(err);
    if (!user) return done(null, false);
    user.comparePassword(password, function(err, isMatch) {
      if (err) return done(err);
      if (isMatch) return done(null, user);
      return done(null, false);
    });
  });
}));

app.set('port', process.env.PORT || 80);
app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '')));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(session({ secret: 'k3yb04rdcat' }));
app.use(passport.initialize());
app.use(passport.session());

//app.post('/base64/:filename', base64image(path.join(__dirname, 'images')));
app.post('/upload/:id', function (req, res){
  var id = req.params.id;
  var base64data = req.body.base64;
  fs.writeFile("images/"+id,base64data,'base64',function(err){
  	console.log(err);
  });
  res.send(200);
});
app.post('/uploadAudio', function (req, res){
  var file = req.body.file;
  //console.log(req.body);
  file.contents = file.contents.split(',').pop();
  fileBuffer = new Buffer(file.contents, "base64");
  fs.writeFile("media/"+file.name,fileBuffer,function(err){
  	console.log(err);
  });
  res.send(200);
});
app.post('/upload', function (req, res){
  uploadImage(req, res, "/images");
});

uploadImage = function(req, res, dir){
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    res.writeHead(200, {'content-type': 'text/plain'});
    res.write('received upload:\n\n');
    res.end(util.inspect({fields: fields, files: files}));
  });

  form.on('end', function(fields, files) {
    /* Temporary location of our uploaded file */
    var temp_path = this.openedFiles[0].path;
    /* The file name of the uploaded file */
    var file_name = this.openedFiles[0].name;
    /* Location where we want to copy the uploaded file */
    var new_location = __dirname+dir;

    fs.copy(temp_path, new_location +"/"+ file_name, function(err) {  
      if (err) {
        console.error(err);
      } else {
        console.log("success!")
      }
    });
  });
}
app.post('/login', passport.authenticate('local'), function(req, res) {
  res.cookie('user', JSON.stringify(req.user));
  res.send(req.user);
});

app.post('/changePassword', function(req, res, next){
  User.findById(req.body.user._id, function(err,user){
    user.password = body.newPassword;
    user.save(function(err){
      if(err) return next(err);
      res.next(200);
    })
  });  
});

app.post('/conversation', function(req, res, next){
  var userA, userB;
  User.findById(req.body.participantA, function(err, participantA){
    userA = participantA;
    User.findById(req.body.participantB, function(err, participantB){
      userB = participantB;
      Conversation.findOne({participantA: userA, participantB: userB}, function(err,existingConversation){
        if(err) return next(err);
        if(existingConversation){
          res.send(existingConversation);
        } 
        else{
          var conversation = new Conversation({
            participantA: userA,
            participantB: userB
          });
          conversation.save(function(err) {
            if (err) return next(err);
            res.send(conversation);
          });
        } 
      });
      
    });
  });
});

app.get('/connectedUsers/:id', function(req, res, next){
  ConnectedUser.findOne({peer:req.params.id}, function(err, connectedUser){
    console.log(connectedUser);
    if(err) return next(err);
    User.findById(connectedUser.user, function(err, user){
      if(err) return next(err);
      res.send(user);
    })
  });
});
app.put('/connectedUsers', function(req, res, next){
  ConnectedUser.findOne({peer:req.body.id}, function(err, connectedUser){
    if(err) return next(err);
    if(connectedUser){
      if(req.body.busy!=null){
        connectedUser.busy = req.body.busy;
      }
      connectedUser.save(function(err){
        if(err) return next(err);
        res.send(connectedUser);  
      })      
    }
    else {
      res.send(200);
    }
  });
});
app.get('/connectedUsers', function(req, res, next){
  ConnectedUser.find({$or: [{busy: null}, {busy: false}]}, function(err, connectedUsers){
    if(err) return next(err);
    res.send(connectedUsers);
  });
});
app.delete('/connectedUsers/:id', function(req, res, next){
  ConnectedUser.findOne({peer: req.params.id}, function(err, connectedUser){
    if(err) return next(err);
    if(connectedUser){
      connectedUser.remove(function(err){
        if(err) return next(err);
        res.send(200);
      });
    }
    else {
      res.send(200);
    }
  });
});
app.post('/connectedUsers', function(req, res, next){
  User.findById(req.body.id, function(err, user){
    if(err) return next(err);
    connectedUser = new ConnectedUser({
      user: user,
      peer: req.body.peer
    });
    connectedUser.save(function(err){
      if(err) return next(err);
      res.send(connectedUser);
    })
  })
});
app.get('/connectedUsers', function(req, res, next){
  var query = ConnectedUser.find();
  query.exec(function(err, connectedUsers){
    if(err) return next(err);
    res.send(connectedUsers);
  })
});
app.get('/conversation/:id', function(req, res, next){
  Conversation.findById(req.params.id, function(err, conversation){
    if(err) return next(err);
    res.send(conversation);
  });
});
app.get('/conversation', function(req, res, next){
  User.findById(req.query.user, function(err,user){
    if(err) return next(err);
    console.log(user);
    Conversation.find({participantA: user}, function(err, conversations){
      console.log(conversations);
      res.send(conversations);
    });
  })
});
app.delete('/conversation/:id', function(req,res,next){
  var remove;
  Conversation.findById(req.params.id, function(err, conversation){
    if(err) return next(err);
    if(conversation.participantA==null && conversation.participantB._id == req.query.user){
      remove = true;
    }
    else if(conversation.participantB==null && conversation.participantA._id == req.query.user){
      remove = true;
    }
    else {
      remove = false;
    }
    if(remove){
      return conversation.remove(function(err){
        res.send(err);
      });
    }
    else {
      if(conversation.participantA._id == req.params.user){
        conversation.participantA = null;
      }
      else if(conversation.participantB._id == req.params.user){
        conversation.participantB = null;
      }
      conversation.save(function(err){
        if(err) res.send(err);
        res.send(200);
      })
    }
  });
})

app.post('/message', function(req, res, next){
  var to, from;
  //var c = JSON.parse(req.body.conversation);
  //Conversation.findById(c._id, function(err, conversation){
  Conversation.findById(req.body.conversation._id, function(err, conversation){
    if(err) return next(err);
      User.findById(req.body.id, function(err, user){
        console.log(user);
        if(err) return next(err);
        var message = new Message({
          user: user,
          date: req.body.date,
          content: req.body.content,
          type: req.body.type
        });
        message.save(function(err){
          if(err) return next(err);
          conversation.messages.push(message);
          conversation.save(function(err){
            if(err) return next(err);
            res.send(200);
          })
        })
      });
  });
});
app.get('/message', function(req, res, next){
  Message.findById(req.query.id, function(err, message){
    if(err) return next(err);
    res.send(message);
  });
});
app.post('/user', function(req, res, next) {
  var user = new User({
    email: req.body.email,
    password: req.body.password,
    interests: req.body.interests,
    gender: req.body.gender,
    anonymous: req.body.anonymous,
    birthdate: req.body.birthdate,
    love: req.body.love,
    friends: req.body.friends,
  });

  user.save(function(err) {
    if (err) return next(err);

  });
  res.send(user);

});
app.put('/user', function(req, res, next) {
  console.log(req.body);
  User.findOne({email:req.body.email}, function(err, user){
    bcrypt.compare(req.body.oldPassword, user.password, function(err, isMatch) {
     
      if(isMatch){
        if(req.body.name){
          user.name = req.body.name;
        }
        if(req.body.country){
          user.country = req.body.country;
        }
        if(req.body.interests){
          user.interests = req.body.interests;
        }
        if(req.body.gender){
          user.gender = req.body.gender;
        }
        if(req.body.anonymous!=null){
          user.anonymous = req.body.anonymous;
        }
        if(req.body.friends!=null){
          user.friends = req.body.friends;
        }
        if(req.body.love!=null){
          user.love = req.body.love;
        }
        if(req.body.password!=null){
          user.password = req.body.password;
        }
        if(req.body.birthdate){
          user.birthdate = req.body.birthdate;
        }
        user.save(function(err) {
          if (err) return next(err);
          res.send(user);
        });
      }
      else {
         res.send(401);
      }
    });
    
  });

});
app.get('/user/:id', function(req, res, next) {
  User.findById(req.params.id, function(err, user) {
    if (err) return next(err);  
    res.send(user);
  });
});


app.get('*', function(req, res) {
  res.redirect('/#' + req.originalUrl);
});
app.use(function(err, req, res, next) {
  if(err){
    console.error(err.stack);
    res.send(500, { message: err.message });
  }
  if (req.user) {
    res.cookie('user', JSON.stringify(req.user));
  }
  next();
});

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});