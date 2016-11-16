var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var TunesetSchema = new mongoose.Schema({
    name:String,
    tunes:[{ type: Schema.Types.ObjectId, ref: 'Tune' }],
    audio:String
});

var Tuneset = mongoose.model('Tuneset', TunesetSchema);

module.exports = Tuneset;
