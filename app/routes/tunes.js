var User = require('../models/user'),
    Song = require('../models/song'),
    {isLoggedIn, getAnnouncements} = require('../services'),
    path = require('path'),
    tunesUploadDir = process.env.OPENSHIFT_DATA_DIR ? path.join(process.env.OPENSHIFT_DATA_DIR, '/tunes/') : path.resolve(__dirname, '../../views/tunes/');

module.exports = function (app, multipartyMiddleware, fs) {
    app.get('/tunes', isLoggedIn, function (req, res) {
      getAnnouncements().then((announcements) => {
        Song.find({}, function (err, tunes) {
            if (err) {
                console.log(err);
                return;
            }
            res.render('tunes', {
                tunes: tunes,
                active: 'tunes',
                announcements:announcements,
                user:req.user
            });
        });
      });
    });
    app.get('/tunes/new', isLoggedIn, function (req, res) {
        res.render('addTune', {
            active: 'tunes',
            user:req.user
        });
    });
    app.post('/tunes', isLoggedIn, multipartyMiddleware, function (req, res) {
      var newSong = {
        name:req.body.name
      };
      var getSong = new Promise((resolve,reject) => {
        Song.findOne({name:req.body.name},function(err,data){
            if(err){
              reject(err);
            }
            resolve(data);
        });
      });


      var fileUploads = [getSong];
      for(var key in req.files){
        let file = req.files[key];
        if(file.name){
          let p = new Promise((resolve, reject) => {
            fs.readFile(file.path, function (err, data) {
              let createDir = tunesUploadDir + '/'+ file.name;
              fs.writeFile(createDir,data,function (err) {
                  if (err) {
                    reject(err);
                  }else{
                    newSong[file.fieldName] = 'tunes/'+file.name;
                    resolve();
                  }
                });
              });
            });
            fileUploads.push(p);
          }
        }
        Promise.all(fileUploads)
        .then(function(values){
          if(values[0]){
            var tune = values[0];
            for(let key in newSong){
              tune[key] = newSong[key];
            }
            tune.save(function(err){
              if(err){
                console.log(err);
              }
              res.redirect('/tunes/'+newSong.name);
            });
          } else{
            Song.create(newSong, function (err, song) {
                if (err) {
                    console.log(err);
                    return;
                }
                res.redirect('/tunes/'+song.name);
            });
          }
        })
        .catch(function(e){
          res.status(400).send(e);
        });

    });
    app.get('/tunes/:name', isLoggedIn, function (req, res) {
      getAnnouncements().then((announcements) => {
        Song.find({
            name: req.params.name
        }, function (err, tune) {
            if (err) {
                console.log(err);
                return;
            }
            res.render('tuneDetail', {
                user: req.user,
                tune: tune[0],
                announcements:announcements,
                user:req.user
            });
        });
      });
    });

    app.get('/tunes/edit/:name', isLoggedIn, function (req, res) {
        Song.findOne({
            name: req.params.name
        }, function (err, tune) {
            if (err) {
                console.log(err);
                return;
            }
            res.render('addTune', {
                tune: tune,
                user:req.user
            });
        });
    });
};
