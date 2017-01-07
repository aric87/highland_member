const Band = require('../models/band');
const logger = require('../../config/logger');

const getAnnouncements = function getAnnouncements(band, isPublic, getAll) {
	return new Promise((resolve, reject) => {
		if (!band) {
			reject('There\'s no band');
		}
		const query = {};
		if (!getAll) {
			if (isPublic) {
				query.showPublic = true;
				query.active = true;
			} else {
				query.showPrivate = true;
				query.active = true;
			}
		}
		Band.findOne({ _id: String(band) })
			.populate({ path: 'announcements', match: query })
			.exec((err, filledBand) => {
				if (err) {
					logger.error(`get announcemement err: ${err}, \n query: ${query}`);
					reject(err);
				}
				resolve(filledBand.announcements);
			});
	});
};

exports.getAnnouncements = getAnnouncements;
