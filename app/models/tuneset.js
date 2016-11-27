var mongoose = require('mongoose'),
Band = require('./band'),
Song = require('./song')
Schema = mongoose.Schema;

var TunesetSchema = new mongoose.Schema({
    name:String,
    tunes:[{ type: Schema.Types.ObjectId, ref: 'Song' }],
    band:{ type: Schema.Types.ObjectId, ref: 'Band'},
    audio:String
});

var Tuneset = mongoose.model('Tuneset', TunesetSchema);

module.exports = Tuneset;
