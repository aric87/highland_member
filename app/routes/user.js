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
    app.post('/profile', isLoggedIn, function(req, res){

        User.findOne({ _id: req.user._id }, function(err, user) {
            if (!user) {
                console.log('error');
                return;
            }
            var params = req.body;
            if(!params.email){params.email = user.email;}
            if(!params.name){params.name = user.name;}
            if(!params.yearsIn){params.yearsIn = user.yearsIn;}
            if(!params.bio){params.bio = user.bio;}

            User.update(user,params,function(err){
                console.log(user);
                    if (err) {
                        res.flash('Some Error Occurred');
                        return;
                    }
                User.findOne({ _id: req.user._id }, function(err, user) {
                    res.render('profile', {
                        mine:true,
                        user: user,
                        active: 'profile'
                    });
                });
                });
            });


        });

    app.get('/profile/edit',isLoggedIn,function (req,res){
        res.render('pedit',{user:req.user,active:'profile'});
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
