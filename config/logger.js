var winston = require('winston');
var path = require('path');
var logDir = process.env.LOGDIR ?  process.env.LOGDIR : path.resolve(__dirname,'../') ;

var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.File)({ filename: logDir + '/winston.log' })
    ]
  });
module.exports = logger;
