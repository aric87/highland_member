var mongoose = require('mongoose'),
Song = require('./song'),
User = require('./user'),
Tuneset = require('./tuneset'),
Document = require('./document'),
Announcement = require('./announcement'),
Venue = require('./venue'),
Schema = mongoose.Schema;

var BandSchema = new mongoose.Schema({
    name:String,
    bandCode:String,
    description:String,
    url:String,
    defaultStartRole:{type:String, default:'noob'},
    keywords:String,
    email:String,
    privateOnly:Boolean,
    timezoneOffset:Number,
    emailAdmins:{type:String, default:'allAdmins'},
    songs:[{ type: Schema.Types.ObjectId, ref: 'Song' }],
    users:[{ type: Schema.Types.ObjectId, ref: 'User' }],
    announcements:[{ type: Schema.Types.ObjectId, ref: 'Announcement' }],
    documents:[{ type: Schema.Types.ObjectId, ref: 'Document' }],
    tunesets:[{ type: Schema.Types.ObjectId, ref: 'Tuneset' }],
    venues:[{ type: Schema.Types.ObjectId, ref: 'Venue' }]



});

var Band = mongoose.model('Band', BandSchema);

module.exports = Band;
