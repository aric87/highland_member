// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var announcementSchema = mongoose.Schema({
        title:String,
        content:String,
        active:{type:Boolean,default:true},
        showPublic:{type:Boolean, default:false},
        showPrivate:{type:Boolean, default:true}
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Announcement', announcementSchema);
