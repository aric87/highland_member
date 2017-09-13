var passport = require('passport');
var sender = require('superagent');
var logger = require('../config/logger');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const wellknown = require('nodemailer-wellknown');
const smtpTransport_highland = nodemailer.createTransport("SMTP",{
    service: "zoho",
    auth: {
            user: "admin@highlandlight.com",
            pass: process.env.EMAIL_PASS
        }
});
const messageData = (sendTo, subject, text) => {
  return {
    'sendTo':sendTo,
    'subject':subject,
    'text':text,
		'highland':true,
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

var sendMessage = (inMailOptions, callback) => {
  // sender
  // .post(process.env.emailServiceUrl)
  // .send(mailOptions)
  // .end(callback);
  var {sendTo, subject, text} = inMailOptions
  return new Promise((resolve, reject) => {
    if (!sendTo || !subject || !text){
      var emessage = 'You\'re missing something: \n';
      if (!sendTo){
        emessage+= 'You need a recieving address. \n';
      }
      if (!subject){
        emessage+= 'You need a subject line. \n';
      }
      if (!text){
        emessage+= 'You need some content. \n';
      }
    }
    var mailOptions = {
        to: sendTo,
        from: "admin@highlandlight.com",
        subject: subject,
        text: text,
    };
    smtpTransport_highland.sendMail(mailOptions, function (err, info) {
      logger.info('here')
      logger.info(err)
      logger.info(info)
      if (err){
        return reject(err);
      }
        return resolve();
    });
  });
};
exports.sendMessage = sendMessage;
