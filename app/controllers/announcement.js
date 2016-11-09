var Announcement = require('../models/announcement');
var logger = require('../../config/logger');

var getAnnouncements = function getAnnouncements(isPublic, getAll){
  return new Promise((resolve, reject) => {
    var query = {};
    if(!getAll){
      if(isPublic){
        query.showPublic = true;
      } else {
        query.showPrivate = true;
      }
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
