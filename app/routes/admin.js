var User       = require('../models/user'),
  Document = require('../models/document'),
  Announcement = require('../models/announcement');
var {isLoggedIn, getAnnouncements} = require('../services');

module.exports = function(app, logger) {
    app.get('/admin', isLoggedIn, function (req, res) {
      if(req.user.role !== 'admin'){
        logger.warn(`${req.user.email} tried accessing admin endpoint`);
        return res.redirect('/profile');
      }
      var anp = new Promise((resolve, reject) => {
        Announcement.find({},(err,data) => {
          if(err){
            logger.error(`admin announcement get err: ${err} `);
            reject(err);
          }
          resolve(data);
        });
      });
      var userp = new Promise((resolve,reject) => {
        User.find({},(err,data) => {
          if(err){
            logger.error(`admin user get err: ${err} `);
            reject(err);
          }
          resolve(data);
        });
      });
      Promise.all([anp,userp]).then(promData => {
        res.render('adminHome',{user:req.user,announcements: promData[0],members:promData[1]});
      }).catch(reason => {
          logger.error(`admin promise err: ${reason} `);
          res.render('adminHome',{user:req.user,message: `There was an error ${reason}`, announcements:'',members:''});
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
        res.render('announcementEdit',{user:req.user, announcement: promData[0]});
      }).catch(reason => {
          logger.error(`admin promise err: ${reason} `);
          res.render('announcementEdit',{user:req.user, message: `There was an error ${reason}`,announcement: ''});

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
             res.sendStatus(500);
          }
          res.sendStatus(200);
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
        res.render('announcementEdit',{user:req.user});
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
        showPrivate:req.body.showPrivate
      };
      var anp = new Promise((resolve, reject) => {
        Announcement.create(newobj,(err,data) => {
          if(err){
            logger.error(`Ann. create error: ${err} `);
            reject(err);
          }
          resolve(data);
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
