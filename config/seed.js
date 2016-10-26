var Song = require('../app/models/song');
var User = require('../app/models/user');

exports.run = function(callback, errback) {
};

if (require.main === module) {
    require('./connect');
    exports.run(function() {
        var mongoose = require('mongoose');
        mongoose.disconnect();
    }, function(err) {
        console.error(err);
    });
}
