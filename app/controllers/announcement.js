var Announcement = require('../models/announcement');
var Band = require('../models/band');
var logger = require('../../config/logger');

var getAnnouncements = function getAnnouncements(band, isPublic, getAll){
  return new Promise((resolve, reject) => {
    if(!band){reject('There\'s no band');}
    var query = {};
    if(!getAll){
      if(isPublic){
        query.showPublic = true;
        query.active = true;
      } else {
        query.showPrivate = true;
        query.active = true;
      }
    }
    Band.findOne({_id:String(band)})
    .populate({path:'announcements',match: query})
    .exec(function (err, band) {
      if (err) {
          logger.error(`get announcemement err: ${err}, \n query: ${query}`);
          reject(err);
      }
      resolve(band.announcements);
    });
  });
};

exports.getAnnouncements = getAnnouncements;
