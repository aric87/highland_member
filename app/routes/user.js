var User = require('../models/user');
var Band = require('../models/band');
var {isLoggedIn} = require('../services');
var {getAnnouncements} = require('../controllers/announcement');
var {emailAdmins, emailuser} = require('../controllers/user');
var {uploadFile} = require('../controllers/files');
var path = require('path');
var profileImageDir  = process.env.DATADIR ? process.env.DATADIR : path.resolve(__dirname, '../../views/');

module.exports = function(app, multipartyMiddleware, fs, logger, sender) {
    app.get('/profile', isLoggedIn, function (req, res, next) {
      var message = "",
      user = req.user,
      mine = true,
      active = 'profile';
      if(req.user.role !== 'admin' && req.user.role !== 'member'){
        req.query.id = req.user._id;
        message = "Your account is waiting for an admin approval. Please hold, your call is important to us.";
      }
      Band.populate(req.band,{path:'announcements',match:{'showPrivate':true,active:true}},function(err,band){

        if(req.query.id && req.query.id !== req.user._id){
          User.findOne({_id:req.query.id},
          function(err, foundUser){
            if(err){
              logger.error(`profile get find err: ${err}`);
              return next(err);
            }
            user = foundUser;
            mine = false;
            active = 'directory';
            res.render('common/profile', {
              band:req.band,
                user: user,
                mine: mine,
                active: active,
                announcements:band.announcements
            });
          });
        } else {
          res.render('common/profile', {
            band:req.band,
              user: user,
              mine: mine,
              active: active,
              announcements:band.announcements
          });
        }
      });
    });
    app.post('/profile/edit', isLoggedIn, multipartyMiddleware, function(req, res, next){
            var user = req.user;
            var params = req.body;
            if(!params.email){params.email = user.email;}
            if(!params.name){params.name = user.name;}
            if(!params.yearsIn){params.yearsIn = user.yearsIn || '';}
            if(!params.bio){params.bio = user.bio || '';}
            if(!params.address){params.address = user.address || '';}
            if(!params.phone){params.phone = user.phone || '';}
            var p;
            if(req.files.profileimage.size){
              p = uploadFile(req.files.profileimage, profileImageDir+'/'+req.band.bandCode +'/profileImages' ).then((fileData) => {
                params.profileImage = '/'+req.band.bandCode +'/profileImages/' +fileData.filename;
              });
            } else {
              params.profileImage = user.profileImage;
            }
            params.inDirectory = params.inDirectory === 'true' ? true : false;
            if(p){
              p.then(updateUser);
            } else {
              updateUser();
            }
            function updateUser(){
              User.update({ _id: req.user._id }, params, function(err){
                if(err){
                  logger.error(`update user err: ${err}, user: ${req.user.email}`);
                  res.flash('Some Error Occurred');
                  return next(err);
                }
                User.findOne({_id:req.user._id},function(err, newUser){
                  if(err){
                    logger.error(`update user find err: ${err}, user: ${req.user.email}`);
                    res.flash('Some Error Occurred');
                    return next(err);
                  }
                  res.render('common/profile', {
                    band:req.band,
                      mine:true,
                      user: newUser,
                      active: 'profile'
                  });
                });

              });
            }
    });

    app.get('/profile/edit', isLoggedIn, function (req,res){
      res.render('common/signup',{band:req.band,user:req.user, active:'profile'});

    });
    app.post('/toggleUser/:id', isLoggedIn, function(req, res, next){
      User.findOne({_id:req.params.id},function(err, data){
        if(err){
          logger.error(`toggleUser user find err: ${err}, user: ${req.user.email}`);
          return res.sendStatus(500);
        }
        if(req.query.action === 'active'){
            data.active = !data.active;
        }
        if(req.query.action === 'role'){
          data.role = req.query.role;
        }
        data.save(function(err){
          if(err){
            logger.error(`toggleUser user save err: ${err}, user: ${req.user.email}, action: ${req.query.action}`);
            res.sendStatus(500);
          }
          let text = '';
          if(req.query.action === 'role'){
            text = `You are receiving this because the status your account on Highland Light\'s member page has been changed.\n\n You are now an ${data.role} user, with all the rights privaleges, and responsibilities. \n\n Please don't share your account information with anyone!`;
          } else if (req.query.action === 'active'){
              text = `You are receiving this because the status your account on Highland Light\'s member page has been changed. You are now an ${data.active ? "active" : "inactive"} user, with all the rights privaleges, and responsibilities. Please don't share your account information with anyone!`;
          }
          emailuser(data.email, 'Account type change', text).then(()=>{
            res.sendStatus(200);
          }).catch((e) =>{
            logger.error(` email user status change err: ${err}`);
            res.sendStatus(500);
          });
        });
      });
    });
    app.post('/profile/imageClear', isLoggedIn, function(req, res){
        req.user.profileImage = '/images/default.jpg';
        req.user.save(function(err) {
            if (err){
              logger.error(`image clear save err: ${err}, user: ${req.user.email}`);
              return res.sendStatus(500);
            }
            res.sendStatus(200);
        });
    });

    app.get('/directory', isLoggedIn, function (req, res) {
      if(req.user.role !== 'admin' && req.user.role !== 'member'){
        return res.redirect('/profile');
      }
      Band.populate(req.band,[{path:'announcements',match:{'showPrivate':true,active:true}},{path:'users'}], function(err,band){
           if (err) {
               logger.error(`geet directory err: ${err}, user: ${req.user.email}`);
               return;
           }
           res.render('common/memberDir', {
               band:req.band,
               members: band.users,
               active: 'directory',
               announcements:band.announcements,
               user:req.user
           });
       });
    });
};
