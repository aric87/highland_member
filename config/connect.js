var mongoose = require('mongoose');
// default to a 'localhost' configuration:
mongoose.Promise = global.Promise;
var connection_string = '127.0.0.1:27017/highland-dev';
// if OPENSHIFT env variables are present, use the available connection info:
// if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
//     connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
//         process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
//         process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
//         process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
//         process.env.OPENSHIFT_APP_NAME;
// }
if(process.env.DATADIR){
  var connection_string = '127.0.0.1:27017/pipeband';
}

mongoose.connect('mongodb://'+connection_string);
