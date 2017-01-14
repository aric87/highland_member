var User       = require('../models/user'),
  Document = require('../models/document'),
  Announcement = require('../models/announcement');
var {getAnnouncements} = require('../controllers/announcement');
var {isLoggedIn} = require('../services');

module.exports = function(app, logger) {
    app.get('/members/admin', isLoggedIn, function (req, res) {
      if(req.user.role !== 'admin'){
        logger.warn(`${req.user.email} tried accessing admin endpoint`);
        return res.redirect('/members/profile');
      }
      Band.populate(req.band,[{path:'announcements'},{path:'users'}],function(err,band){
        if(err){
          logger.error(`admin promise err: ${reason} `);
          res.render('common/adminHome',{band:req.band,user:req.user,message: `There was an error ${reason}`, announcements:'',members:''});
        }
        res.render('common/adminHome',{band:req.band,user:req.user,announcements: band.announcements,members:band.users});

      });
    });
    app.get('/members/admin/edit', isLoggedIn, function (req, res) {
      if(req.user.role !== 'admin'){
        logger.warn(`${req.user.email} tried accessing admin endpoint`);
        return res.redirect('/members/profile');
      }

        res.render('common/adminEdit',{band:req.band,user:req.user});

    });
    app.post('/members/admin/edit', isLoggedIn, function (req, res) {
      if(req.user.role !== 'admin'){
        logger.warn(`${req.user.email} tried accessing admin endpoint`);
        return res.redirect('/members/profile');
      }
      let {name, description, url, publicPages, privateOnly, timezoneOffset, defaultStartRole, keywords, emailAdmins, email} = req.body;

      req.band.name = name;
      req.band.privateOnly = privateOnly;
      req.band.description = description;
      req.band.url = url;
      req.band.timezoneOffset = timezoneOffset * 60 ;
      req.band.defaultStartRole = defaultStartRole;
      req.band.email = email;
      req.band.emailAdmins = emailAdmins;
      req.band.publicPages = publicPages.split(', ');

      req.band.save(function(err,band){
        if(err){
          console.log(err)
        }
        console.log(band);
        res.redirect('/members/admin');
      })
    });
    app.get('/members/announcement/edit', isLoggedIn, function (req, res) {
      if(req.user.role !== 'admin'){
        logger.warn(`${req.user.email} tried accessing ann. edit endpoint`);
        return res.redirect('/members/profile');
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
        res.render('common/announcementEdit',{band:req.band,user:req.user, announcement: promData[0]});
      }).catch(reason => {
          logger.error(`admin promise err: ${reason} `);
          res.render('common/announcementEdit',{band:req.band,user:req.user, message: `There was an error ${reason}`,announcement: ''});

      });
    });
    app.post('/members/announcement/edit', isLoggedIn, function (req, res) {
      if(req.user.role !== 'admin'){
        logger.warn(`${req.user.email} tried accessing ann. edit endpoint`);
        return res.redirect('/members/profile');
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
        Announcement.findOneAndUpdate({_id:req.body.annId},newobj,(err,data) => {
          if(err){
            logger.error(`Ann. update eget error: ${err}, id: ${req.query.id}, field: ${req.query.field} `);
            reject(err);
          }
          resolve(data);
        });
      });
      Promise.all([anp]).then(function(promData){
        res.redirect('/members/admin');
      }).catch(reason => {
        logger.error(`Ann. update promise err: ${reason} `);
        res.redirect('/members/admin');
      });
    });
    app.get('/members/announcement/new', isLoggedIn, function (req, res) {
      if(req.user.role !== 'admin'){
        logger.error(`Ann. new accessed by non admin:  ${req.user.email} `);
        return res.redirect('/members/profile');
      }
        res.render('common/announcementEdit',{band:req.band,user:req.user});
      });
    app.post('/members/announcement/new', isLoggedIn, function (req, res) {
      if(req.user.role !== 'admin'){
        logger.error(`Ann. new post accessed by non admin:  ${req.user.email} `);
        return res.redirect('/members/profile');
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
        res.redirect('/members/admin');
      });
    });
};
