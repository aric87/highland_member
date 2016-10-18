var User       = require('../models/user');
var isLoggedIn = require('../services');

module.exports = function(app) {
    app.get('/profile', isLoggedIn, function (req, res) {
        var user = req.user,
        mine = true,
        active = 'profile';


        if(req.query.id && req.query.id !== req.user._id){
          console.log(req.query);
          User.findOne({_id:req.query.id},
          function(err, foundUser){
            if(err){
              console.log(err);
              return;
            }
            user = foundUser;
            mine = false;
            active = 'directory';
            res.render('profile', {
                user: user,
                mine: mine,
                active: active
            });
          });
        } else {
          res.render('profile', {
              user: user,
              mine: mine,
              active: active
          });
        }

    });
    app.post('/profile/edit', isLoggedIn, function(req, res){
            var user = req.user;
            var params = req.body;
            console.log('params before',params);
            if(!params.email){params.email = user.email;}
            if(!params.name){params.name = user.name;}
            if(!params.yearsIn){params.yearsIn = user.yearsIn || '';}
            if(!params.bio){params.bio = user.bio || '';}
            if(!params.address){params.address = user.address || '';}
            if(!params.phone){params.phone = user.phone || '';}
            params.inDirectory = params.inDirectory === 'true' ? true : false;
            console.log('params after ',params);

            User.update({ _id: req.user._id }, params, function(err){
                    if (err) {
                      console.log('err ', err);
                        res.flash('Some Error Occurred');
                        return;
                    }
                    User.findOne({_id:req.user._id},function(err, newUser){
                      if (err){ return console.log(err);}
                      res.render('profile', {
                          mine:true,
                          user: newUser,
                          active: 'profile'
                      });
                    });

            });
    });

    app.get('/profile/edit',isLoggedIn,function (req,res){
        res.render('signup',{user:req.user, active:'profile'});
    });
    app.get('/directory', isLoggedIn, function (req, res) {
       User.find({},function(err,members){
           if (err) {
               console.log('error');
               return;
           }
           console.log('members',members);
           res.render('memberDir', {
               members: members,
               active: 'directory'
           });
       }) ;

    });
};
