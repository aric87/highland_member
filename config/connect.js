var mongoose = require('mongoose');
// default to a 'localhost' configuration:
mongoose.Promise = global.Promise;
var connection_string = '127.0.0.1:27017/highland-dev';
if(process.env.DATADIR){
  var connection_string = '127.0.0.1:27017/pipeband';
}

mongoose.connect('mongodb://'+connection_string);
