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
						logger.error(`email admin message was: ${content}`)
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
				sendMessage(mailOptions).then((resp) => {
					logger.warn('email all admins for new user');
					logger.error(`email admin message was: ${content}`)
					resolve();
				}).catch((err) => {
				reject(err);
			});
		}).catch((err) => {
			reject(err);
		})

		} else {
			const mailOptions = messageData(band.email, subject, content);
			sendMessage(mailOptions).then((resp) => {
				logger.warn('email all band for new user');
				logger.error(`email admin message was: ${content}`)
				resolve();
			}).catch((err) => {
				logger.info(err)
				logger.info('reject')
			reject(err);
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
