var mongoose = require('mongoose');

var BandSchema = new mongoose.Schema({
    name:String,
    bandCode:String,
    tunes:[{ type: Schema.Types.ObjectId, ref: 'Tune' }],
    tuneset:{ type: Number, ref: 'Tuneset' }
});

var Band = mongoose.model('Band', BandSchema);

module.exports = Song;
