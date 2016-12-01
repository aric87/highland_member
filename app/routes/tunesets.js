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
    app.get('/tunesets', isLoggedIn, function (req, res, next) {
        Band.populate(req.band,[{path:'tunesets'},{path:'announcements',match:{'showPrivate':true,active:true}}], function (err, band) {
            if (err) {
              logger.error(` /tunes song find err: ${err}`);
              return next(err);
            }
            res.render('tuneset', {
                band:req.band,
                tunesets: band.tunesets,
                active: 'tunes',
                announcements:band.announcements,
                user:req.user
            });
        });
    });
    app.get('/tunesets/new', isLoggedIn, function (req, res) {
      Band.populate(req.band,{path:'songs'}, function (err, band) {
          if (err) {
            logger.error(` /tuneset song find err: ${err}`);
            return next(err);
          }
          res.render('addTuneset', {
              band:req.band,
              active: 'tunes',
              tunes:band.songs,
              user:req.user
          });
        });
    });
    app.get('/tunesets/:name', isLoggedIn, function (req, res, next) {

        Band.populate(req.band,[{path:'announcements',match:{showPrivate:true, active:true}}, {path:'tunesets',options: { limit: 1 },populate:{path:'songs'}}],function (err, band) {
            if (err) {
              logger.error(`tune get err: ${err}, name: ${req.params.name}`);
                return next(err);
            }
            res.render('tunesetDetail', {
                band:req.band,
                user: req.user,
                active:'tunes',
                tuneset: band.tunesets[0],
                announcements:band.announcements
            });
        });

    });

    app.get('/tunesets/edit/:id', isLoggedIn, function (req, res, next) {
      Band.populate(req.band,[{path:'announcements',match:{showPrivate:true, active:true}},{path:'songs'}, {path:'tunesets',options: { limit: 1 },populate:{path:'songs'}}],function (err, band) {
          if (err) {
            logger.error(`tune get err: ${err}, name: ${req.params.name}`);
              return next(err);
          }
          res.render('addTuneset', {
              band:req.band,
              tunes:band.songs,
              user: req.user,
              tuneset: band.tunesets[0]
          });
      });
    });
    app.post('/tunesets', isLoggedIn, multipartyMiddleware, function (req, res, next) {
      var newSet = {
        name:req.body.name,
        tunes:[]
      };
      var getSet = new Promise((resolve,reject) => {
        Tuneset.findOne({name:req.body.name},function(err, data){
            if(err){
              logger.error(`post tuneset find err: ${err}, name: ${req.body.name}`);
              reject(err);
            }
            resolve(data);
        });
      });

      var fileUploads = [getSet];
      if(req.files.fullAudio.name){
        let p = uploadFile(req.files.fullAudio, tunesUploadDir+'/'+req.band.bandCode+'/tunes');
        logger.warn('file ' + req.files.fullAudio.name);
        fileUploads.push(p);
      }
      Promise.all(fileUploads).then((values) => {
          if(values[0]){
            var set = values[0];
            if(values[1]){
              set.audio = '/'+req.band.bandCode +'/tunes/'+values[1].filename;
            }
            set.songs = [];
            for(let key in req.body.tune){
              if(req.body.tune[key]){
                set.songs.push(req.body.tune[key]);
              }
            }
            set.save(function(err){
              if(err){
                logger.error(`tuneset update save err: ${err}, name: ${req.body.name}`);
                return next(err);
              }
              res.redirect('/tunesets/'+set.name);
            });
          } else {
            if(values[1]){
              newSet.audio = '/'+req.band.bandCode +'/tunes/'+values[1].filename;
            }
            newSet.songs = [];
            for(let key in req.body.tune){
              newSet.songs.push(req.body.tune[key]);
            }
            newSet.band = req.band._id;
            Tuneset.create(newSet, function (err, set) {
                if (err) {
                  logger.error(`tuneset create err: ${err}, name: ${req.body.name}`);
                  return next(err);
                }
                req.band.tunesets.push(set);
                req.band.save((err)=>{
                  if(err){
                    logger.error(`add set save error ${err}`);
                  }
                  res.redirect('/tunesets/'+set.name);
                });


            });
          }
        })
        .catch(function(err){
          logger.error(`tune create err: ${err}, name: ${req.body.name}`);
          res.status(400).send(err);
        });

    });
};
