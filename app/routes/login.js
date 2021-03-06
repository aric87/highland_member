var User       = require('../models/user');
var Song       = require('../models/song');
var {getAnnouncements} = require('../controllers/announcement');
var {uploadFile} = require('../controllers/files');
var {emailAdmins, emailuser} = require('../controllers/user');
var {isLoggedIn} = require('../services');

module.exports = function (app, passport, async, crypto, sender, multipartyMiddleware, logger) {
    app.get('/login', function (req, res) {
        getAnnouncements(req.band.id,'public').then(function(announcements){
          res.render('common/login', {band:req.band, message:req.flash('loginMessage'),announcements:announcements });
        });
    });
    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/members/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    // SIGNUP =================================
    // show the signup form

    app.get('/signup', function (req, res) {
        res.render('common/signup', {band:req.band,message: '' });
    });
    // process the signup form
    app.post('/signup', multipartyMiddleware, function (req, res, next) {
        passport.authenticate('local-signup', function (err, user, info) {
            if (err) {
                logger.error(` signup post error: ${err}`);
                return next(err);
              }
            if (!user) {
              logger.error(` signup post no user: ${user}`);
              return res.redirect('/login');
            }
            let text = 'You are receiving this because you (or someone else) have created an account on Highland Light\'s member page.\n\n' +
            'Your account has been created, however you will not be able to access anything on the site besides your profile until your account has been approved. \n\n Naturally, we want to keep band stuff super secret. We hope you understand.' +
            'If you forget your password, you can reset it on the site. Be sure to update your profile!';

            emailuser(user.email, 'New Account', text).then(() =>{

                let adminMessage = `A new user has signed up for the site with the email ${user.email}. If you recognize the email, you should login and set their account type to member, so they can access the site. Otherwise, let Aric know so he can take care of tracking down the perp trying to steal our secrets`;

                emailAdmins('New user Signup', adminMessage, req.band).catch((err) => {
                  logger.error(`Admin email error caught: ${err}`);
                }).then(() =>{
                  if(req.band.defaultStartRole == 'member' || req.band.defaultStartRole == 'admin' ){
                    req.logIn(user, function (err) {
                        if (err) {
                          logger.error(` signup post login user error: ${err}`);
                          return res.redirect('/login');
                        }
                        return res.redirect('/members/profile/');
                    });
                  } else {
                    req.flash('loginMessage','Your account has successfully been created. For security reasons, the band needs to enabled your account before you\'ll be able to access any of the member content.')
                    return res.redirect('/login');
                  }
                });
              }).catch((err)=>{
                logger.error(` email new user err: ${err}`);
                User.remove({email:user.email},function(err){
                    if(err){
                      logger.error(`remove error: ${err}`);
                    }
                    logger.warn('bad user email account removed');
                    req.flash('loginMessage','There was a problem sending the welcome email do to an error with the email address you signed up with. This account has been removed. Contact the system admin to correct problem');
                    return res.redirect('/login');
                });

              });
        })(req, res, next);
    });
    // LOGOUT ==============================
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });
    app.get('/forgot', function (req, res) {
        res.render('common/forgot', {
            band:req.band,
            user: req.user
        });
    });
    app.post('/forgot', function (req, res, next) {
      logger.info(`${req.body.email} has requested a password reset token`);
        async.waterfall([
            function (done) {
                crypto.randomBytes(20, function (err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            function (token, done) {
                User.findOne({ email: req.body.email }, function (err, user) {
                    if(err){
                        logger.error(`forgot: find user err: ${err}`);
                        return next(err);
                    }
                    if (!user) {
                        return res.redirect('/forgot');
                    }

                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                    user.password = User.generateHash(token + Date.now());

                    user.save(function (err) {
                        if(err){
                          logger.error(`forgot: user save err: ${err}`);
                        }
                        done(err, token, user);
                    });
                });
            },
            function (token, user, done) {

              let text = 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
              'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
              'http://' + req.headers.host + '/reset/' + token + '\n\n' +
              'If you did not request this, please ignore this email and your password will remain unchanged.\n' +
              'This is an auto-generated email. Responses will be lost in the abyss.';
              emailuser(user.email, 'Password Reset', text).then((err)  => {
                  if(err){
                    logger.error(` email new user err: ${err}`);
                  }
                  done(err, 'done');
              });
            }
        ],
        function (err) {
            if (err){
              logger.error(` waterfall err: ${err}`);
               return next(err);
             }
            req.logout();
            res.redirect('/');
        });
    });
    app.get('/reset/:token', function (req, res, next) {

        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
            if(err){
              logger.error(` get reset token finOne err: ${err}`);
              return next(err);
            }
            if (!user) {
               logger.info(`someone tried to reset with a bad token`);
                return res.redirect('/forgot');
            }
           logger.info(`${user.email} visited the password reset page with a good token`);
            res.render('common/reset', {
              band:req.band,
                user: user
            });
        });
    });

    app.post('/reset/:token', function (req, res, next) {
        async.waterfall([
            function (done) {
                User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
                    if(err){
                      logger.error(` post reset token finOne err: ${err}`);
                      return next(err);
                    }
                    if (!user) {
                        console.log('User find error');
                        return res.redirect('back');
                    }

                    user.password = req.body.password[0];
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpires = undefined;
                    user.save(function (err) {
                        if (err) {
                          logger.error(` post reset token user save err: ${err}`);
                        }
                        logger.info(`${user.email} successfully changed their password`);
                        done(err, user);
                    });
                });
            },
            function (user, done) {
              let text = 'Hello,\n\n' +
              'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n';
              emailuser(user.email, 'Your password has been changed', text)
              .then(() => {
                done(null, 'done');
              })
              .catch((err)=>{
                if(err){
                  logger.error(` email new user err: ${err}`);
                }
                done(err, 'done');
              });

            }
        ], function (err) {
            if(err){
              logger.error(` waterfall reset post err: ${err}`);
            }
            res.redirect('/login');
        });
    });
};
