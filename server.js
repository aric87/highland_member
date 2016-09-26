// get all the tools we need
require('./config/connect');
var express  = require('express');
var app      = express();
var port     = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var app_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var swig = require('swig');
var crypto = require('crypto');
var async = require('async');
var fs = require('fs');
var path = require('path');
var sender = require('superagent');

var multipart = require('connect-multiparty');
var multipartyMiddleware = multipart();

var isLoggedIn = require('./app/services');
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('combined',{stream:accessLogStream}));
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // get information from html forms
// required for passport
app.use(session({
  secret: 'HighlandLight',
  cookie: { maxAge: 360000 },
  resave: true,
  saveUninitialized: true
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.all('/tunes/*', isLoggedIn, function(req, res, next){next();});
app.use(express.static('views'));
// routes ======================================================================
require('./app/routes/login.js')(app, passport, async, crypto, sender); // load our routes and pass in our app and fully configured passport
require('./app/routes/user.js')(app); // load our routes and pass in our app and fully configured passport
require('./app/routes/files.js')(app, multipartyMiddleware, fs);
require('./app/routes/tunes.js')(app, multipartyMiddleware, fs);

// launch ======================================================================
app.listen(port,app_ip_address);
console.log('The magic happens on port ' + port);
