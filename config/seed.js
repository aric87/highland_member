var Band = require('../app/models/band');
var User = require('../app/models/user');
var Announcement = require('../app/models/announcement');

exports.run = function(callback, errback) {
  Band.create({
    name:'Highland Light',
    bandCode:"hlpb",
    active:true
  }, function(err){
    if (err){
      console.log(err)
    }
    callback()
  })
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
