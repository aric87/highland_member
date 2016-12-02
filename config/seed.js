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
      if (err) {
        return errback(err);
      }
      User.find({}, (err, users) => {
        users.forEach(()=>{
        band.users.push(this._id);

        });
      Song.find({},(err,songs) =>{
        songs.forEach(()=>{
          band.songs.push(this._id);
          this.band = band._id;
          for(let key in this){
            if(this[key].substring(0, 4) === "tun"){
              this[key] = "/hlpb/"+ this[key];
            }
          }
          this.save(()=>{});
        })
      });
      Document.find({},(err,docs) =>{
        docs.forEach(()=>{
          band.documents.push(this._id);
          this.file = "/hlpb/"+this.file;
          this.band = band._id;
          this.save(()=>{});
        })
      });
        band.save(function(err){
          if(err){
            return errback(err);
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
