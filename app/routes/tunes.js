var User = require('../models/user'),
    Song = require('../models/song'),
    isLoggedIn = require('../services'),
    path = require('path'),
    tunesUploadDir = process.env.OPENSHIFT_DATA_DIR ? path.resolve(process.env.OPENSHIFT_DATA_DIR, '/tunes/') : path.resolve(__dirname, '../../views/tunes/');

module.exports = function (app, multipartyMiddleware, fs) {

    app.get('/tunes', function (req, res) {
        Song.find({}, function (err, tunes) {
            if (err) {
                console.log(err);
                return;
            }
            res.render('tunes', {
                tunes: tunes,
                active: 'tunes'
            });
        });
    });
    app.get('/tunes/new', function (req, res) {
        res.render('addTune', {
            active: 'tunes'
        });
    });
    app.post('/tunes', multipartyMiddleware, function (req, res) {
      console.log(tunesUploadDir);
      var newSong = {};


      var fileUploads = [];
      for(var key in req.files){
        let file = req.files[key];
        if(file.name){
          let p = new Promise((resolve, reject) => {
            fs.readFile(file.path, function (err, data) {
              let createDir = tunesUploadDir + '/' + file.name;
              fs.writeFile(createDir,data,function (err) {
                  if (err) {
                    reject(err);
                  }else{
                    newSong[file.fieldName] = createDir;
                    resolve();
                  }
                });
              });
            });
            fileUploads.push(p);
          }
        }
        Promise.all(fileUploads)
        .then(function(){
          Song.create(newSong, function (err, song) {
              if (err) {
                  console.log(err);
                  return;
              }
              res.redirect('/tunes/'+song.name);
          });

        })
        .catch(function(e){
          res.status(400).send(err);
        });

    });
    app.get('/tunes/:name', function (req, res) {
        Song.find({
            name: req.params.name
        }, function (err, tune) {
            if (err) {
                console.log(err);
                return;
            }
            res.render('tuneDetail', {
                user: req.user,
                tune: tune[0]
            });
        });
    });

    app.get('/tunes/edit/:name', function (req, res) {
        Song.findOne({
            name: req.params.name
        }, function (err, tune) {
            if (err) {
                console.log(err);
                return;
            }
            res.render('addTune', {
                tune: tune
            });
        });
    });
};
