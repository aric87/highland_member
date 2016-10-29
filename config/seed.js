var Song = require('../app/models/song');
var User = require('../app/models/user');
var Announcement = require('../app/models/announcement');

exports.run = function(callback, errback) {
  Announcement.create({
    title:'Test',
    content:"Lorem iassdlk ka l ;gna galgj",
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
