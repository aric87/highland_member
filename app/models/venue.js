var mongoose = require('mongoose'),
Schema = mongoose.Schema,
Band = require('./band'),
Event = require('./event');

var VenueSchema = new mongoose.Schema({
    name:String,
    location:String,
    address:String,
    description:String,
    events:[{ type: Schema.Types.ObjectId, ref: 'Event'}],
    band:{ type: Schema.Types.ObjectId, ref: 'Band'}
});

var Venue = mongoose.model('Venue', VenueSchema);

module.exports = Venue;
