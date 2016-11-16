var User = require('../models/user'),
    Song = require('../models/song'),
    Tuneset = require('../models/tuneset'),
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
    app.get('/tuneset', isLoggedIn, function (req, res, next) {
      getAnnouncements().catch((e)=>{logger.error(e);}).then((announcements) => {
        Tuneset.find({}, function (err, tuneset) {
            if (err) {
              logger.error(` /tunes song find err: ${err}`);
              return next(err);
            }
            res.render('tuneset', {
                tuneset: tuneset,
                active: 'tunes',
                announcements:announcements,
                user:req.user
            });
        });
      });
    });
    app.get('/tuneset/new', isLoggedIn, function (req, res) {
      Song.find({}, function (err, tunes) {
          if (err) {
            logger.error(` /tuneset song find err: ${err}`);
            return next(err);
          }
          res.render('addTuneset', {
              active: 'tunes',
              tunes:tunes,
              user:req.user
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
            for(let i = 0, j=values.length;i<j;i++){
              if(i===0){continue;}
              newSong[values[i].field] = 'tunes/'+values[i].filename;
            }
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
    app.post('/tuneset', isLoggedIn, multipartyMiddleware, function (req, res, next) {
      var newSet = {
        name:req.body.name,
        tunes:[]
      };
      console.log(newSet);
      console.log(req.body);
      var getSet = new Promise((resolve,reject) => {
        Tuneset.findOne({name:req.body.name},function(err,data){
            if(err){
              logger.error(`post tuneset find err: ${err}, name: ${req.body.name}`);
              reject(err);
            }
            resolve(data);
        });
      });

      var fileUploads = [getSet];
      if(req.files.fullAudio){
        let p = uploadFile(req.files.fullAudio, tunesUploadDir);
        logger.warn('file ' + req.files.fullAudio.name);
        fileUploads.push(p);
      }
      Promise.all(fileUploads).then((values) => {
        console.log('here')
          if(values[0]){
            var set = values[0];
            if(values[1]){
              set.audio = 'tunes/'+values[1].filename;
            }
            for(let key in req.body.tune){
              set.tunes.push(req.body.tune[key]);
            }
            console.log(set, set.tunes, req.body.tunes);
            set.save(function(err){
              if(err){
                logger.error(`tune update save err: ${err}, name: ${req.body.name}`);
                return next(err);
              }
              res.redirect('/tuneset/'+newSet.name);
            });
          } else {
            console.log('val 1 ', values[1])
            if(values[1]){
              newSet.audio = 'tunes/'+values[1].filename;
            }
            for(let key in req.body.tune){
              console.log('req tune ', req.body.tune[key])
              newSet.tunes.push(req.body.tune[key]);
            }
            console.log(newSet.tunes, req.body.tune);
            Tuneset.create(newSet, function (err, song) {
                if (err) {
                  logger.error(`tune create err: ${err}, name: ${req.body.name}`);
                  return next(err);
                }
                // res.redirect('/tuneset/'+song.name);
                res.redirect('/profile')
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
