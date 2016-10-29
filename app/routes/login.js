var User       = require('../models/user');
var Song       = require('../models/song');
var {isLoggedIn, getAnnouncements} = require('../services');

module.exports = function (app, passport, async, crypto, sender, multipartyMiddleware) {
    const emailServiceUrl = 'http://emailservice-memsearch.rhcloud.com/email';
    let messageData = (sendTo, subject, text) => {
      return {
        'sendTo':sendTo,
        'subject':subject,
        'text':text,
        'slackOption':false
      };
    };
    // show the login form
    app.get('/', function (req, res) {
        getAnnouncements('public').then(function(announcements){
          res.render('login', { message: req.flash('loginMessage'),announcements:announcements });
        });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    // SIGNUP =================================
    // show the signup form

    app.get('/signup', function (req, res) {
        res.render('signup', { message: req.flash('loginMessage') });
    });
    // process the signup form
    app.post('/signup', multipartyMiddleware, function (req,res,next) {
        passport.authenticate('local-signup', function (err, user, info) {
            if (err) {
                return next(err);
              }
            if (!user) {
              return res.redirect('/');
            }
            req.logIn(user, function (err) {
                if (err) {
                  return next(err);
                }
                let text = 'You are receiving this because you (or someone else) have created an account on Highland Light\'s member page.\n\n' +
                'If you forget your password, you can reset it on the site. Be sure to update your profile!';

                var mailOptions = messageData(user.email, 'New Account', text);
                sender
                .post(emailServiceUrl)
                .send(mailOptions)
                .end(function (err) {
                    return res.redirect('/profile/');
                });
            });
        })(req, res, next);
    });
    // LOGOUT ==============================
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('http://www.highlandlight.com/');
    });
    app.get('/forgot', function (req, res) {
        res.render('forgot', {
            user: req.user
        });
    });
    app.post('/forgot', function (req, res, next) {
        async.waterfall([
            function (done) {
                crypto.randomBytes(20, function (err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            function (token, done) {
                User.findOne({ email: req.body.email }, function (err, user) {
                    if (!user) {
                        console.log('error');
                        req.flash('error', 'No account with that email address exists.');
                        return res.redirect('/forgot');
                    }

                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                    user.password = User.generateHash(token + Date.now());

                    user.save(function (err) {
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
                    var mailOptions = messageData(user.email, 'Password Reset', text);
                    sender
                    .post(emailServiceUrl)
                    .send(mailOptions)
                    .end(function (err) {
                        done(err, 'done');
                    });
            }
        ],
        function (err) {
            if (err){
               return next(err);
             }
            req.logout();
            res.redirect('/');
        });
    });
    app.get('/reset/:token', function (req, res) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
            if (!user) {
                req.flash('error', 'Password reset token is invalid or has expired.');
                return res.redirect('/forgot');
            }
            res.render('reset', {
                user: user
            });
        });
    });

    app.post('/reset/:token', function (req, res) {
        async.waterfall([
            function (done) {
                User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
                    if (!user) {
                        req.flash('error', 'Password reset token is invalid or has expired.');
                        console.log('User find error');
                        return res.redirect('back');
                    }
                    user.password = req.body.password[0];
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpires = undefined;
                    user.save(function (err) {
                        if (err) {
                          console.log(err);
                        }
                        done(err, user);
                    });
                });
            },
            function (user, done) {
              let text = 'Hello,\n\n' +
              'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n';
              var mailOptions = messageData(user.email, 'Your password has been changed', text);
              sender
              .post(emailServiceUrl)
              .send(mailOptions)
              .end(function (err) {
                  done(err, 'done');
              });
            }
        ], function (err) {
            res.redirect('/');
        });
    });
};
