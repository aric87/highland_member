const mongoose = require('mongoose');
const Song = require('./song');
const User = require('./user');
const Tuneset = require('./tuneset');
const Document = require('./document');
const Announcement = require('./announcement');
const Venue = require('./venue');

const Schema = mongoose.Schema;
const BandSchema = new mongoose.Schema({
	name: String,
	bandCode: String,
	description: String,
	url: String,
	defaultStartRole: { type: String, default: 'noob' },
	keywords: String,
	email: String,
	privateOnly: Boolean,
	timezoneOffset: Number,
	publicPages: [String],
	emailAdmins: { type: String, default: 'allAdmins' },
	songs: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
	users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	announcements: [{ type: Schema.Types.ObjectId, ref: 'Announcement' }],
	documents: [{ type: Schema.Types.ObjectId, ref: 'Document' }],
	tunesets: [{ type: Schema.Types.ObjectId, ref: 'Tuneset' }],
	venues: [{ type: Schema.Types.ObjectId, ref: 'Venue' }],
});

module.exports = mongoose.model('Band', BandSchema);
