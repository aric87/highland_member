var winston = require('winston');
var path = require('path');
var logDir = process.env.OPENSHIFT_LOG_DIR ? process.env.OPENSHIFT_LOG_DIR : path.resolve(__dirname,'../') ;

var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.File)({ filename: logDir + '/somefile.log' })
    ]
  });
module.exports = logger;
