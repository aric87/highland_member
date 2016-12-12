var mongoose = require('mongoose'),
Schema = mongoose.Schema,
Band = require('./band'),
Venue = require('./venue');

var EventSchema = new mongoose.Schema({
   date:Date,
   description:String,
   uniform:String,
   venue:{ type: Schema.Types.ObjectId, ref: 'Venue'},
   band:{ type: Schema.Types.ObjectId, ref: 'Band'}
});

var Event = mongoose.model('Event', EventSchema);

module.exports = Event;
