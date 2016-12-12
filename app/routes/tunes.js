var User = require('../models/user'),
    Song = require('../models/song'),
    Band = require('../models/band'),
    {uploadFile} = require('../controllers/files'),
    {isLoggedIn} = require('../services'),
    path = require('path'),
    tunesUploadDir = process.env.DATADIR ? process.env.DATADIR : path.resolve(__dirname, '../../views/');

module.exports = function (app, multipartyMiddleware, fs, logger) {
    app.get('/music',isLoggedIn,(req, res, next)=>{
      Band.populate(req.band,[{path:'announcements',match:{'showPrivate':true,active:true}}], function (err, band) {
          if (err) {
            logger.error(` /music song find err: ${err}`);
            return next(err);
          }
          res.render('common/music', {
              band:band,
              active: 'tunes',
              announcements:band.announcements,
              user:req.user
          });
      });
    });
    app.get('/tunes', isLoggedIn, function (req, res, next) {
        Band.populate(req.band,[{path:'songs'}, {path:'announcements',match:{'showPrivate':true,active:true}}],
          function (err, band) {
            if (err) {
              logger.error(` /tunes song find err: ${err}`);
              return next(err);
            }
            res.render('common/tunes', {
              band:req.band,
                tunes: band.songs,
                active: 'tunes',
                announcements:band.announcements,
                user:req.user
            });
        });
    });
    app.get('/tunes/new', isLoggedIn, function (req, res) {
        res.render('common/addTune', {
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
            res.render('common/tuneDetail', {
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
            res.render('common/addTune', {
                band:req.band,
                tune: tune,
                user:req.user
            });
        });
    });
};
