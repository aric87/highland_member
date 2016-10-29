var User       = require('../models/user'),
  Document = require('../models/document'),
  Announcement = require('../models/announcement');
var {isLoggedIn, getAnnouncements} = require('../services');

module.exports = function(app) {
    app.get('/admin', isLoggedIn, function (req, res) {
      if(req.user.role !== 'admin'){
        return res.redirect('/profile');
      }
      var anp = new Promise((resolve, reject) => {
        Announcement.find({},(err,data) => {
          if(err){
            reject(err);
          }
          resolve(data);
        });
      });
      var userp = new Promise((resolve,reject) => {
        User.find({},(err,data) => {
          if(err){
            reject(err);
          }
          resolve(data);
        });
      });
      Promise.all([anp,userp]).then(function(promData){
        res.render('adminHome',{user:req.user,announcements: promData[0],members:promData[1]});
      });
    });

    app.get('/announcement/edit', isLoggedIn, function (req, res) {
      if(req.user.role !== 'admin'){
        res.redirect('/profile');
      }
      var anp = new Promise((resolve, reject) => {
        Announcement.findOne({_id:req.query.id},(err,data) => {
          if(err){
            reject(err);
          }

          resolve(data);
        });
      });
      Promise.all([anp]).then(function(promData){
        res.render('announcementEdit',{user:req.user, announcement: promData[0]});
      });
    });
    app.post('/announcement/edit', isLoggedIn, function (req, res) {
      if(req.query.action === 'delete'){

        Announcement.findByIdAndRemove(req.query.id, (err, data) => {
          if(err){
             res.sendStatus(500);
          }
          res.sendStatus(200);
        });
        return ;
      }
      if(req.query.action === 'toggle'){
        Announcement.findById(req.query.id, (err, data) => {
          if(err){
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
            reject(err);
          }
          resolve(data);
        });
      });
      Promise.all([anp]).then(function(promData){
        res.redirect('/admin');
      });
    });
    app.get('/announcement/new', isLoggedIn, function (req, res) {
      if(req.user.role !== 'admin'){
        res.redirect('/profile');
      }
        res.render('announcementEdit',{user:req.user});
      });
    app.post('/announcement/new', isLoggedIn, function (req, res) {
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
            reject(err);
          }
          resolve(data);
        });
      });
      Promise.all([anp]).then(function(promData){
        res.redirect('/admin');
      });
    });
};
