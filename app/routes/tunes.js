var User = require('../models/user'),
    Song = require('../models/song'),
    Band = require('../models/band'),
    Tuneset = require('../models/tuneset'),
    {getAnnouncements} = require('../controllers/announcement'),
    {uploadFile} = require('../controllers/files'),
    {isLoggedIn} = require('../services'),
    path = require('path'),
    tunesUploadDir = process.env.DATADIR ? process.env.DATADIR : path.resolve(__dirname, '../../views/');

module.exports = function (app, multipartyMiddleware, fs, logger) {
    app.get('/tunes', isLoggedIn, function (req, res, next) {
        Band.populate(req.band,[{path:'songs'}, {path:'announcements',match:{'showPrivate':true,active:true}}],
          function (err, band) {
            if (err) {
              logger.error(` /tunes song find err: ${err}`);
              return next(err);
            }
            res.render('tunes', {
              band:req.band,
                tunes: band.songs,
                active: 'tunes',
                announcements:band.announcements,
                user:req.user
            });
        });
    });
    app.get('/tunesets', isLoggedIn, function (req, res, next) {
        Band.populate(req.band,[{path:'tunesets'},{path:'announcements',match:{'showPrivate':true,active:true}}], function (err, band) {
            if (err) {
              logger.error(` /tunes song find err: ${err}`);
              return next(err);
            }
            res.render('tuneset', {
              band:req.band,
                tuneset: band.tunesets,
                active: 'tunes',
                announcements:band.announcements,
                user:req.user
            });
        });
    });
    app.get('/tuneset/new', isLoggedIn, function (req, res) {
      Band.populate(req.band,{path:'tunes'}, function (err, band) {
          if (err) {
            logger.error(` /tuneset song find err: ${err}`);
            return next(err);
          }
          res.render('addTuneset', {
            band:req.band,
              active: 'tunes',
              tunes:band.tunes,
              user:req.user
          });
        });
    });
    app.get('/tunes/new', isLoggedIn, function (req, res) {
        res.render('addTune', {
          band:req.band,
            active: 'tunes',
            user:req.user
        });
    });
    app.post('/tunes', isLoggedIn, multipartyMiddleware, function (req, res, next) {
      var newSong = {
        name:req.body.name
      };
      var getSong = new Promise((resolve,reject) => {
        if(!req.body.songId){return resolve(null);}
        Song.findOne({_id:req.body.songId},function(err,data){
            if(err){
              logger.error(`post song find err: ${err}, name: ${req.body.name}`);
              reject(err);
            }
            if(data){
              resolve(data);
            } else{
              resolve(null);
            }

        });
      });
      var fileUploads = [getSong];
      for(var key in req.files){
        let file = req.files[key];
        if(file.name){
            let p = uploadFile(file, tunesUploadDir+'/'+req.band.bandCode+'/tunes');
            logger.warn('file ' + file.name);
            fileUploads.push(p);
          }
      }
      Promise.all(fileUploads).then((values) => {
          if(values[0]){
            var tune = values[0];
            for(let key in values){
              tune[values[key].field] = '/'+req.band.bandCode +'/tunes/'+values[key].filename;
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
              newSong[values[i].field] = '/'+req.band.bandCode +'/tunes/'+values[i].filename;
            }
            newSong.band = req.band._id;
            Song.create(newSong, function (err, song) {
                if (err) {
                  logger.error(`tune create err: ${err}, name: ${req.body.name}`);
                  return next(err);
                }

                req.band.songs.push(song._id);
                req.band.save(function(err){
                  if(err){
                    return next(err);
                  }
                  res.redirect('/tunes/'+song.name);
                });
            });
          }
        })
        .catch(function(e){
          logger.error(`tune create catch err: ${e}, name: ${req.body.name}`);
          next(e);
        });

    });

    app.get('/tunes/:name', isLoggedIn, function (req, res, next) {

        Band.populate(req.band,[{path:'announcements',match:{showPrivate:true, active:true}}, {path:'songs',match:{name:req.params.name},options: { limit: 1 }}],function (err, band) {
            if (err) {
              logger.error(`tune get err: ${err}, name: ${req.params.name}`);
                return next(err);
            }
            console.log(band)
            res.render('tuneDetail', {
              band:req.band,
                user: req.user,
                tune: band.songs[0],
                announcements:band.announcements
            });
        });

    });

    app.get('/tunes/edit/:id', isLoggedIn, function (req, res, next) {
        Song.findOne({
            _id: req.params.id
        }, function (err, tune) {
            if (err) {
                logger.error(`tune edit, get err: ${err}, name: ${req.params.name}`);
                return next(err);
            }
            res.render('addTune', {
              band:req.band,
                tune: tune,
                user:req.user
            });
        });
    });
    app.post('/tunesets', isLoggedIn, multipartyMiddleware, function (req, res, next) {
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
            if(values[1]){
              newSet.audio = 'tunes/'+values[1].filename;
            }
            for(let key in req.body.tune){
              newSet.tunes.push(req.body.tune[key]);
            }
            console.log(newSet.tunes, req.body.tune);
            Tuneset.create(newSet, function (err, song) {
                if (err) {
                  logger.error(`tune create err: ${err}, name: ${req.body.name}`);
                  return next(err);
                }
                // res.redirect('/tuneset/'+song.name);
                res.redirect('/profile');
            });
          }
        })
        .catch(function(e){
          logger.error(`tune create err: ${err}, name: ${req.body.name}`);
          res.status(400).send(e);
        });

    });
};
