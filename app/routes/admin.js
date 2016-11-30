var User       = require('../models/user'),
  Document = require('../models/document'),
  Announcement = require('../models/announcement');
var {getAnnouncements} = require('../controllers/announcement');
var {isLoggedIn} = require('../services');

module.exports = function(app, logger) {
    app.get('/admin', isLoggedIn, function (req, res) {
      if(req.user.role !== 'admin'){
        logger.warn(`${req.user.email} tried accessing admin endpoint`);
        return res.redirect('/profile');
      }
      Band.populate(req.band,[{path:'announcements'},{path:'users'}],function(err,band){
        if(err){
          logger.error(`admin promise err: ${reason} `);
          res.render('adminHome',{band:req.band,user:req.user,message: `There was an error ${reason}`, announcements:'',members:''});
        }
        res.render('adminHome',{band:req.band,user:req.user,announcements: band.announcements,members:band.users});

      });
    });

    app.get('/announcement/edit', isLoggedIn, function (req, res) {
      if(req.user.role !== 'admin'){
        logger.warn(`${req.user.email} tried accessing ann. edit endpoint`);
        return res.redirect('/profile');
      }
      var anp = new Promise((resolve, reject) => {
        Announcement.findOne({_id:req.query.id},(err,data) => {
          if(err){
            logger.error(`admin user get err: ${err} `);
            reject(err);
          }
          resolve(data);
        });
      });
      Promise.all([anp]).then(function(promData){
        res.render('announcementEdit',{band:req.band,user:req.user, announcement: promData[0]});
      }).catch(reason => {
          logger.error(`admin promise err: ${reason} `);
          res.render('announcementEdit',{band:req.band,user:req.user, message: `There was an error ${reason}`,announcement: ''});

      });
    });
    app.post('/announcement/edit', isLoggedIn, function (req, res) {
      if(req.user.role !== 'admin'){
        logger.warn(`${req.user.email} tried accessing ann. edit endpoint`);
        return res.redirect('/profile');
      }
      if(req.query.action === 'delete'){

        Announcement.findByIdAndRemove(req.query.id, (err, data) => {
          if(err){
             logger.error(`Ann. delete error: ${err}, id: ${req.query.id} `);
             return res.sendStatus(500);
          }
          req.band.announcements = req.band.announcements.filter(function(anid){
            return String(anid) !== req.query.id;
          });
          req.band.save(function(err){
            if(err){
              logger.error(`Error removing announcement frmo Band `);
              return res.sendStatus(500);
            }
            return res.sendStatus(200);
          });

        });
        return ;
      }
      if(req.query.action === 'toggle'){
        Announcement.findById(req.query.id, (err, data) => {
          if(err){
            logger.error(`Ann. toggle error: ${reason}, id: ${req.query.id} `);
             res.sendStatus(500);
          }
          if(req.query.field === 'active'){
            data.active = !data.active;
          } else if (req.query.field === 'showpublic'){
            data.showPublic = !data.showPublic;
          } else if (req.query.field === 'showprivate'){
            data.showPrivate = !data.showPrivate;
          } else {
            res.sendStatus(400);
          }
          data.save(function(err,d){
            if(err){
              logger.error(`Ann. toggle save error: ${err}, id: ${req.query.id}, field: ${req.query.field} `);
              res.sendStatus(500);
            }
            res.sendStatus(200);

          });
        });
        return;
      }
      var newobj = {
        title:req.body.title,
        content:req.body.content,
        active:req.body.active,
        showPublic:req.body.showPublic,
        showPrivate:req.body.showPrivate
      };
      var anp = new Promise((resolve, reject) => {
        Announcement.findOneAndUpdate({id:req.params.id},newobj,(err,data) => {
          if(err){
            logger.error(`Ann. update eget error: ${err}, id: ${req.query.id}, field: ${req.query.field} `);
            reject(err);
          }
          resolve(data);
        });
      });
      Promise.all([anp]).then(function(promData){
        res.redirect('/admin');
      }).catch(reason => {
        logger.error(`Ann. update promise err: ${reason} `);
        res.redirect('/admin');
      });
    });
    app.get('/announcement/new', isLoggedIn, function (req, res) {
      if(req.user.role !== 'admin'){
        logger.error(`Ann. new accessed by non admin:  ${req.user.email} `);
        return res.redirect('/profile');
      }
        res.render('announcementEdit',{band:req.banduser:req.user});
      });
    app.post('/announcement/new', isLoggedIn, function (req, res) {
      if(req.user.role !== 'admin'){
        logger.error(`Ann. new post accessed by non admin:  ${req.user.email} `);
        return res.redirect('/profile');
      }
      var newobj = {
        title:req.body.title,
        content:req.body.content,
        active:req.body.active,
        showPublic:req.body.showPublic,
        showPrivate:req.body.showPrivate,
        band:req.band._id
      };
      var anp = new Promise((resolve, reject) => {
        Announcement.create(newobj,(err,data) => {
          if(err){
            logger.error(`Ann. create error: ${err} `);
            return reject(err);
          }
          req.band.announcements.push(data._id);
          req.band.save(function(err){
            if(err){
              logger.error(`push announ to band error `);
              return reject(err);
            }
            resolve(data);
          });
        });
      });
      Promise.all([anp]).then(function(promData){
        res.redirect('/admin');
      }).catch(reason => {
        logger.error(`Ann. create promise err: ${reason} `);
        res.redirect('/admin');
      });
    });
};
