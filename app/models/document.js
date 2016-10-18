var mongoose = require('mongoose');

var DocSchema = new mongoose.Schema({
    name:String,
    file:String
});

var Document = mongoose.model('Document', DocSchema);

module.exports = Document;
