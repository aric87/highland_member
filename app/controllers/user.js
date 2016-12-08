var User = require('../models/user');
var logger = require('../../config/logger');
var {messageData, sendMessage} = require('../services');

var emailAdmins = function emailAdmins(subject, content, band){
  return new Promise((resolve, reject) => {
    if(band.emailAdmins == 'allAdmins'){
      var p = new Promise((res,rej) => {
        Band.populate(band,{path:'users',match:{role:'admin'}}, function(err, band){
        if(err){
          logger.error('an error occured in the email admin function: '+ err);
          rej(err);
        }
        if(!band.users.length){
          rej('No Admin users');
        }

        var admins = band.users.map(function(user){
          return user.email;
        }).join(', ');
        res(admins);
        });
      });
    }

    if(p){
      p.then((admins)=>{
        var mailOptions = messageData(admins, subject, content);
        sendMessage(mailOptions, function (err) {
            if(err){
              logger.error(` email admin email  err: ${err}`);
              reject(err);
            }
          logger.warn(` email all admins for new user`);
            resolve();
        });
      }).catch((err)=>{
        reject(err);
      });
    } else {
    var mailOptions = messageData(band.email, subject, content);
    sendMessage(mailOptions, function (err) {
        if(err){
          logger.error(` email band email  err: ${err}`);
          reject(err);
        }
        logger.warn(` email band only for new user`);
        resolve();
    });
    }
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
