var Band = require('../app/models/band');
var User = require('../app/models/user');
var Song = require('../app/models/song');
var Document = require('../app/models/document');
var Announcement = require('../app/models/announcement');

exports.run = function(callback, errback) {
  var band = new Promise((resolve, reject)=>{
    Band.findOne({bandCode:'hlpb'}, function(err,band){
      if(err){
        reject(err);
      }
      resolve(band);
    });
  });
  band.then((band) =>{
    Document.find({}, function(err, documents){
        if(err){
          reject(err);
        }
        var documentsIds = documents.map(function(document){
          document.band = band._id;
          document.save(function(err){
            if(err){
              console.log(err);
            }
          });
          return document._id;
        });
        band.documents = documentsIds;
        band.save(function(err){
          if(err){
            return err;
          }
          callback();
      });
      });
    });
};

if (require.main === module) {
    require('./connect');
    exports.run(function() {
        var mongoose = require('mongoose');
        mongoose.disconnect();
    }, function(err) {
        console.error(err);
    });
}
