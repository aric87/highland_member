const logger = require('../../config/logger');
const Band = require('../models/band');
const { messageData, sendMessage } = require('../services');

const emailAdmins = function emailAdmins(subject, content, band) {
	return new Promise((resolve, reject) => {
		let p = null;
		if (band.emailAdmins === 'allAdmins') {
			p = new Promise((res, rej) => {
				Band.populate(band, { path: 'users', match: { role: 'admin' } }, (err, filledBand) => {
					if (err) {
						logger.error(`an error occured in the email admin function: ${err}`);
						rej(err);
					}
					if (!filledBand.users.length) {
						rej('No Admin users');
					}
					const admins = band.users.map(user => user.email).join(', ');
					res(admins);
				});
			});
		}

		if (p) {
			p.then((returnedAdmins) => {
				const mailOptions = messageData(returnedAdmins, subject, content);
				sendMessage(mailOptions, (err) => {
					if (err) {
						logger.error(`email admin email  err: ${err}`);
						reject(err);
					}
					logger.warn('email all admins for new user');
					resolve();
				});
			}).catch((err) => {
				reject(err);
			});
		} else {
			const mailOptions = messageData(band.email, subject, content);
			sendMessage(mailOptions, (err) => {
				if (err) {
					logger.error(` email band email  err: ${err}`);
					reject(err);
				}
				logger.warn('email band only for new user');
				resolve();
			});
		}
	});
};
exports.emailAdmins = emailAdmins;

const emailuser = function emailuser(userEmail, subject, content) {
	return new Promise((resolve, reject) => {
		const mailOptions = messageData(userEmail, subject, content);
		sendMessage(mailOptions, (err) => {
			if (err) {
				logger.error(` email userEmail err: ${err}, user: ${userEmail}, subject ${subject}, content: ${content}`);
				reject(err);
			}
			resolve();
		});
	});
};
exports.emailuser = emailuser;
