var passport = require('passport');
var Announcement = require('./models/announcement');
var logger = require('../config/logger');
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
