var passport = require('passport');
var Announcement = require('./models/announcement');
var logger = require('../config/logger');
var User = require('./models/user');
var sender = require('superagent');
const messageData = (sendTo, subject, text) => {
  return {
    'sendTo':sendTo,
    'subject':subject,
    'text':text,
    'slackOption':false
  };
};
exports.messageData = messageData;
var isLoggedIn = function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()){
        return next();
    }
    logger.warn(`req.auth failed. user: ${req.user}, \n path: ${req.path}`);
    res.redirect('/');
  };

exports.isLoggedIn = isLoggedIn;

var getAnnouncements = function getAnnouncements(isPublic){
  return new Promise((resolve, reject) => {
    var query = {};
    if(isPublic){
      query.showPublic = true;
    } else {
      query.showPrivate = true;
    }
    Announcement.find(query, function (err, announcements) {
      if (err) {
          logger.error(`get announcemement err: ${err}, \n query: ${query}`);
          reject(err);
      }
      resolve(announcements);
    });
  });
};

exports.getAnnouncements = getAnnouncements;

var emailAdmins = function emailAdmins(subject, content){
  return new Promise((resolve, reject) => {
    User.find({role:'admin'}, function(err,users){
      if(err){
        logger.error('an error occured in the email admin funciton: '+ err);
        reject(err);
      }
      if(!users.length){
        reject('No Admin users');
      }
      var admins = users.map(function(user){
        return user.email;
      }).join(', ');

      var mailOptions = messageData(admins, subject, content);
      sender
      .post(process.env.emailServiceUrl)
      .send(mailOptions)
      .end(function (err) {
          if(err){
            logger.error(` email admin email  err: ${err}`);
            reject(err);
          }
          resolve();
      });
  });
});
};
exports.emailAdmins = emailAdmins;
var emailuser = function emailuser(userEmail, subject, content){
  return new Promise((resolve, reject) => {
      var mailOptions = messageData(userEmail, subject, content);
      sender
      .post(process.env.emailServiceUrl)
      .send(mailOptions)
      .end(function (err) {
          if(err){
            logger.error(` email userEmail err: ${err}, user: ${userEmail}, subject ${subject}, content: ${content}`);
            reject(err);
          }
          resolve();
      });
  });
};
exports.emailuser = emailuser;
