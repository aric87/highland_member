const logger = require('../../config/logger');
const fs = require('fs');

const uploadFile = (file, directory) => {
	if (!fs.existsSync(directory)) {
		fs.mkdirSync(directory);
	}
	logger.warn(`file stuff ${file.name} ${directory}`);
	return new Promise((resolve, reject) => {
		fs.readFile(file.path, (err, data) => {
			if (err) {
				logger.error(`post file err: ${err}, directory ${directory}, file: ${file.name}`);
				return reject(err);
			}
			const newFilename = Date.now() + file.name;
			const createDir = `${directory}/${newFilename}`;
			fs.writeFile(createDir, data, (innerErr) => {
				if (innerErr) {
					logger.error(`post file write err: ${innerErr}, directory: ${directory}, file: ${file.name}`);
					return reject(innerErr);
				}
				logger.warn('resolved');
				return resolve({
					field: file.fieldName,
					filename: newFilename,
				});
			});
		});
	});
};

exports.uploadFile = uploadFile;
