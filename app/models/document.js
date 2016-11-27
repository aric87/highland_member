var mongoose = require('mongoose'),
Schema = mongoose.Schema,
Band = require('./band');

var DocSchema = new mongoose.Schema({
    name:String,
   file:String,
   band:{ type: Schema.Types.ObjectId, ref: 'Band'}
});

var Document = mongoose.model('Document', DocSchema);

module.exports = Document;
