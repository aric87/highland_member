var mongoose = require('mongoose');

var SongSchema = new mongoose.Schema({
    name:String,
    melody:String,
    seconds:String,
    thirds:String,
    snare:String,
    tenors:String,
    bass:String,
    fullAudio:String,
    drumAudio:String,
    pipeAudio:String,
    practiceAudio:String
});

var Song = mongoose.model('Song', SongSchema);

module.exports = Song;
