var mongoose = require('mongoose'),
Schema = mongoose.Schema,
Band = require('./band');

const pageSchema = new mongoose.Schema({
	name: { type: String, required: true},
	url: { type: String, required: true, unique: true},
	page_css: String,
	content: String,
	active: { type: Boolean, default: true },
});

module.exports = mongoose.model('Page', pageSchema);
