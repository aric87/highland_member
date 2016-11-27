// load the things we need
var mongoose = require('mongoose'),
Schema = mongoose.Schema,
Band = require('./band');

// define the schema for our user model
var announcementSchema = mongoose.Schema({
        title:String,
        content:String,
        active:{type:Boolean, default:false},
        showPublic:{type:Boolean, default:false},
        showPrivate:{type:Boolean, default:false},
        band:{ type: Schema.Types.ObjectId, ref: 'Band'}
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Announcement', announcementSchema);
