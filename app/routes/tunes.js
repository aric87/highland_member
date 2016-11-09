var User = require('../models/user'),
    Song = require('../models/song'),
    {getAnnouncements} = require('../controllers/announcement'),
    {uploadFile} = require('../controllers/files'),
    {isLoggedIn} = require('../services'),
    path = require('path'),
    tunesUploadDir = process.env.OPENSHIFT_DATA_DIR ? path.join(process.env.OPENSHIFT_DATA_DIR, '/tunes/') : path.resolve(__dirname, '../../views/tunes/');

module.exports = function (app, multipartyMiddleware, fs, logger) {
    app.get('/tunes', isLoggedIn, function (req, res, next) {
      getAnnouncements().catch((e)=>{logger.error(e);}).then((announcements) => {
        Song.find({}, function (err, tunes) {
            if (err) {
              logger.error(` /tunes song find err: ${err}`);
              return next(err);
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
    app.post('/tunes', isLoggedIn, multipartyMiddleware, function (req, res, next) {
      var newSong = {
        name:req.body.name
      };
      var getSong = new Promise((resolve,reject) => {
        Song.findOne({name:req.body.name},function(err,data){
            if(err){
              logger.error(`post song find err: ${err}, name: ${req.body.name}`);
              reject(err);
            }
            resolve(data);
        });
      });

      var fileUploads = [getSong];
      for(var key in req.files){
        let file = req.files[key];
        if(file.name){
            let p = uploadFile(file, tunesUploadDir);
            logger.warn('file ' + file.name);
            fileUploads.push(p);
          }
      }
      Promise.all(fileUploads).then((values) => {
          if(values[0]){
            var tune = values[0];
            for(let key in values){
              tune[values[key].field] = 'tunes/'+values[key].filename;
            }
            tune.save(function(err){
              if(err){
                logger.error(`tune update save err: ${err}, name: ${req.body.name}`);
                return next(err);
              }
              res.redirect('/tunes/'+newSong.name);
            });
          } else {
            Song.create(newSong, function (err, song) {
                if (err) {
                  logger.error(`tune create err: ${err}, name: ${req.body.name}`);
                  return next(err);
                }
                res.redirect('/tunes/'+song.name);
            });
          }
        })
        .catch(function(e){
          logger.error(`tune create err: ${err}, name: ${req.body.name}`);
          res.status(400).send(e);
        });

    });
    app.get('/tunes/:name', isLoggedIn, function (req, res, next) {
      getAnnouncements().catch((e)=>{logger.error(e);}).then((announcements) => {
        Song.find({
            name: req.params.name
        }, function (err, tune) {
            if (err) {
              logger.error(`tune get err: ${err}, name: ${req.params.name}`);
                return next(err);
            }
            res.render('tuneDetail', {
                user: req.user,
                tune: tune[0],
                announcements:announcements
            });
        });
      });
    });

    app.get('/tunes/edit/:name', isLoggedIn, function (req, res, next) {
        Song.findOne({
            name: req.params.name
        }, function (err, tune) {
            if (err) {
                logger.error(`tune edit, get err: ${err}, name: ${req.params.name}`);
                return next(err);
            }
            res.render('addTune', {
                tune: tune,
                user:req.user
            });
        });
    });
};
