var mongoose = require('mongoose'),
Schema = mongoose.Schema,
Band = require('./band'),
Tuneset = require('./tuneset');

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
    practiceAudio:String,
    band:{ type: Schema.Types.ObjectId, ref: 'Band'},
    tuneset:{ type: Schema.Types.ObjectId, ref: 'Tuneset' }
});

var Song = mongoose.model('Song', SongSchema);

module.exports = Song;
