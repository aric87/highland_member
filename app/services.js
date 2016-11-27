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
    if (req.isAuthenticated() && String(req.user.band) == String(req.band._id)){
        return next();
    }
    if(req.user){
      logger.warn(`req.auth failed. user: ${req.user}, \n path: ${req.path} band: ${req.band._id} user band:  ${req.user.band}`);
    } else {
      logger.warn(`req.auth failed. no user, \n path: ${req.path} band: ${req.band._id}`);
    }
    res.redirect('/');
  };

exports.isLoggedIn = isLoggedIn;

var sendMessage = (mailOptions, callback) => {
  sender
  .post(process.env.emailServiceUrl)
  .send(mailOptions)
  .end(callback);
};
exports.sendMessage = sendMessage;
