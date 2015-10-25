var passport = require('passport');
var isLoggedIn = function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
};
module.exports = isLoggedIn;