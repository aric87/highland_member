var Band = require('../app/models/band');
var User = require('../app/models/user');
var Song = require('../app/models/song');
var Document = require('../app/models/document');
var Announcement = require('../app/models/announcement');

exports.run = function(callback, errback) {
  var newBand = {
    name:"Highland Light Scottish Pipe Band",
    bandCode:"hlpb",
    songs:[],
    users:[],
    announcements:[],
    documents:[],
    tunesets:[]
  };
  Band.create(newBand, function (err, band) {
    callback();
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
