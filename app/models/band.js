var mongoose = require('mongoose')Schema = mongoose.Schema;

var BandSchema = new mongoose.Schema({
    name:String,
    bandCode:String,
    tunes:[{ type: Schema.Types.ObjectId, ref: 'Tune' }]
});

var Band = mongoose.model('Band', BandSchema);

module.exports = Song;
