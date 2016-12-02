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
        console.log(songs)
        songs.forEach((song)=>{
          band.songs.push(song._id);
          song.band = band._id;
          for(let key in song){
            if(typeof song[key] == "string" && song[key].substring(0, 4) === "tune"){
              song[key] = "/hlpb/"+ song[key];
            }
          }
          song.save(()=>{});

        })

      });
      Document.find({},(err,docs) =>{
        docs.forEach((doc)=>{
          band.documents.push(doc._id);
          doc.file = "/hlpb/"+doc.file;
          doc.band = band._id;
          doc.save(()=>{});
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
