var mongoose = require('mongoose'),
Song = require('./song'),
User = require('./user'),
Tuneset = require('./tuneset'),
Document = require('./document'),
Announcement = require('./announcement'),
Schema = mongoose.Schema;

var BandSchema = new mongoose.Schema({
    name:String,
    bandCode:String,
    songs:[{ type: Schema.Types.ObjectId, ref: 'Song' }],
    users:[{ type: Schema.Types.ObjectId, ref: 'User' }],
    announcements:[{ type: Schema.Types.ObjectId, ref: 'Announcement' }],
    documents:[{ type: Schema.Types.ObjectId, ref: 'Document' }],
    tunesets:[{ type: Schema.Types.ObjectId, ref: 'Tuneset' }],
    defaultStartRole:{type:String, default:'noob'}


});

var Band = mongoose.model('Band', BandSchema);

module.exports = Band;
