var passport = require('passport');
var Announcement = require('./models/announcement');
var isLoggedIn = function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
  };

exports.isLoggedIn = isLoggedIn;

var getAnnouncements = function getAnnouncements(isPublic){
  return new Promise((resolve,reject) => {
    var query = {};
    if(isPublic){
      query.showPublic = true;
    } else {
      query.showPrivate = true;
    }
    Announcement.find(query, function (err, announcements) {
      if (err) {
          console.log(err);
          reject(err);
      }
      resolve(announcements);
    });
  });
};

exports.getAnnouncements = getAnnouncements;
