var path = require('path');
var logger = require('../../config/logger');
var fs = require('fs');

var uploadFile = (file, directory) => {
  if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory);
  }
  logger.warn('file stuff' + file.name + ' ' + directory);
  return new Promise((resolve, reject) => {
  fs.readFile(file.path, function (err, data) {
    if(err){
      logger.error(`post file err: ${err}, directory ${directory}, file: ${file.name}`);
      return reject(err);
    }
    let newFilename = Date.now() + file.name;
    let createDir = directory + '/' + newFilename;
    fs.writeFile(createDir, data, function (err) {
      if(err){
        logger.error(`post file write err: ${err}, directory: ${directory}, file: ${file.name}`);
        reject(err);
        }else{
          resolve({"field":file.fieldName, "filename":newFilename});
          logger.warn('resolved');
        }
      });
    });
  });
};

exports.uploadFile = uploadFile;
