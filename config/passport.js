// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;
var User       = require('../app/models/user'),
Band = require('../app/models/band'),
path = require('path'),
fs = require('fs'),
{uploadFile} = require('../app/controllers/files'),
profileImageDir  = process.env.DATADIR ? process.env.DATADIR : path.resolve(__dirname, '../views/');


module.exports = function(passport, logger) {
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function(req, email, password, done) {
                Band.populate(req.band,{path:'users',match:{ 'email' :  email},options:{limit:1}},function(err,band){
                    var user = band.users[0];
                    if (err){
                      logger.error(`Login error: ${err}, \n email: ${email}`);
                      return done(err);
                    }
                    // if no user is found, return the message
                    if (!user || !user.validPassword(password) ){
                        logger.warn(`Invalid login attempt. \n email: ${email}, \n pass: ${password}`);
                        return done(null, false, req.flash('loginMessage', 'Username or Password are incorrect'));
                    }
                    if (!user.active){
                        logger.warn(`Inactive login attempt. \n email: ${email}`);
                        return done(null, false, req.flash('loginMessage','Your user account is inactive. Contact your system administrator to get it reactivated'));
                    }
                    if(user.role !== 'admin' && user.role !== 'member'){
                      logger.warn(`Invalid role attempt. \n email: ${email} role: ${user.role}`);
                      return done(null, false, req.flash('loginMessage','Your user account hasn\'t been enabled by an admin. Contact your system administrator.'));
                    }
                    else{
                      logger.info(`${user.email} has logged in`);
                        return done(null, user);
                    }
                });
        }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function(req, email, password, done) {
                //  Whether we're signing up or connecting an account, we'll need
                //  to know if the email address is in use.
                User.findOne({'email': email}, function(err, existingUser) {
                    // if there are any errors, return the error
                    if (err){
                        logger.error(`Signup error: ${err} \n email: ${email}`);
                        return done(err);
                    }
                    // check to see if there's already a user with that email
                    if (existingUser){
                        logger.warn(`Signup with existing email: \n email: ${email}`);
                        return done(null, false, req.flash('signupMessage','That email is already taken.'));
                      }
                    //  If we're logged in, we're connecting a new local account.
                    if(req.user) {
                        return done(null,req.user);
                    }
                    //  We're not logged in, so we're creating a brand new user.
                    else {
                        // create the user
                        var newUser = new User();
                        newUser.email    = email;
                        newUser.password = password;
                        newUser.name = req.body.name;
                        newUser.yearsIn = req.body.years || '';
                        newUser.bio = req.body.about || '';
                        newUser.phone = req.body.phone || '';
                        newUser.address = req.body.address || '';
                        newUser.inDirectory = req.body.inDirectory === 'true'? true : false;
                        var p;
                        if(req.files.profileimage.size){
                          p = uploadFile(req.files.profileimage, profileImageDir + "/" + req.band.bandCode + '/profileImages/').then((fileData) => {
                            newUser.profileImage = '/'+req.band.bandCode +'/profileImages/' +fileData.filename;
                          });
                        }
                        if(p){
                          //  if there's a file, wait for it to upload
                          p.then(saveUser);
                        } else{
                          saveUser();
                        }
                        function saveUser(){
                          newUser.save(function(err) {
                              if (err){
                                  logger.error(`user create erro on signup: ${err}, \n email: ${email},`);
                                  throw err;
                              }
                              req.band.users.push(newUser.id);
                              req.band.save(function(err){
                                if(err){
                                  logger.error(`error putting the user in the band ${req.band}, ${newUser.name}`);
                                  next(err);
                                }
                                logger.info(`new user created: ${newUser.name}, \n email: ${newUser.email},`);
                                return done(null, newUser);
                              });

                          });
                        }
                    }

                });
        }));



};
