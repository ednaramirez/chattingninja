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

app.set('port', process.env.PORT || 80);
app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '')));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

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

app.get('*', function(req, res) {
  res.redirect('/#' + req.originalUrl);
});
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.send(500, { message: err.message });
});
app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});