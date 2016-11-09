var User = require('../models/user');
var logger = require('../../config/logger');
var {messageData, sendMessage} = require('../services');

var emailAdmins = function emailAdmins(subject, content){
  return new Promise((resolve, reject) => {
    User.find({role:'admin'}, function(err, users){
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
      sendMessage(mailOptions, function (err) {
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
      sendMessage(mailOptions, function (err) {
          if(err){
            logger.error(` email userEmail err: ${err}, user: ${userEmail}, subject ${subject}, content: ${content}`);
            reject(err);
          }
          resolve();
      });
  });
};
exports.emailuser = emailuser;
