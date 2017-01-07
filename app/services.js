var passport = require('passport');
var sender = require('superagent');
var logger = require('../config/logger');

const messageData = (sendTo, subject, text) => {
  return {
    'sendTo':sendTo,
    'subject':subject,
    'text':text,
    'slackOption':false
  };
};
exports.messageData = messageData;

var isLoggedIn = (req, res, next) => {

    if (req.isAuthenticated() && (req.user.role == 'member' || req.user.role == 'admin')){
        return next();
    }
    if(req.user){
      logger.warn(`req.auth failed. user: ${req.user}, \n path: ${req.path} band: ${req.band._id} user band:  ${req.user.band}`);
      req.flash('loginMessage','There was an error logging you in. If you\'ve recently created a new account, the system administrator may need to activate the account before being able to sign in.');
    } else {
      logger.warn(`req.auth failed. no user, \n path: ${req.path} band: ${req.band._id}`);
    }
    res.redirect('/login');
  };

exports.isLoggedIn = isLoggedIn;

var sendMessage = (mailOptions, callback) => {
  sender
  .post(process.env.emailServiceUrl)
  .send(mailOptions)
  .end(callback);
};
exports.sendMessage = sendMessage;
