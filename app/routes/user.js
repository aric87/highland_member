var User       = require('../models/user');
var {isLoggedIn, getAnnouncements} = require('../services'),
path = require('path'),
profileImageDir  = process.env.OPENSHIFT_DATA_DIR ? path.join(process.env.OPENSHIFT_DATA_DIR, '/profileImages/') : path.resolve(__dirname, '../../views/profileImages/');

module.exports = function(app, multipartyMiddleware, fs, logger) {
    app.get('/profile', isLoggedIn, function (req, res, next) {
        var user = req.user,
        mine = true,
        active = 'profile';
        getAnnouncements().then((announcements) => {
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
            res.render('profile', {
                user: user,
                mine: mine,
                active: active,
                announcements:announcements
            });
          });
        } else {
          res.render('profile', {
              user: user,
              mine: mine,
              active: active,
              announcements:announcements
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
              p = new Promise((resolve, reject) =>{
                fs.readFile(req.files.profileimage.path, function (err, data) {
                    if(err){
                      logger.error(`profile image upload read err: ${err}, user: ${req.user}`);
                      return reject(err);
                    }
                    var fileName = Date.now() + req.files.profileimage.name;
                    var createDir = profileImageDir + '/' + fileName;
                    fs.writeFile(createDir, data, function (err) {
                      if(err){
                        logger.error(`profile image upload write err: ${err}, user: ${req.user.email}`);
                        return reject(err);
                      } else {
                          params.profileImage = '/profileImages/' +fileName;
                          resolve(  params.profileImage);
                        }
                    });
                });
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
                        res.render('profile', {
                            mine:true,
                            user: newUser,
                            active: 'profile'
                        });
                      });

              });
            }
    });

    app.get('/profile/edit', isLoggedIn, function (req,res){
      res.render('signup',{user:req.user, active:'profile'});

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
          res.sendStatus(200);
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
      getAnnouncements().then((announcements) => {
       User.find({},function(err,members){
           if (err) {
               logger.error(`geet directory err: ${err}, user: ${req.user.email}`);
               return;
           }
           res.render('memberDir', {
               members: members,
               active: 'directory',
               announcements:announcements,
               user:req.user
           });
       }) ;

    });
    });
};
