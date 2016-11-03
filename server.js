// get all the tools we need
require('./config/connect');
var express  = require('express');
var helmet = require('helmet');
var csp = require('helmet-csp');
var app      = express();
app.use(helmet());
app.use(csp({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", 'maxcdn.bootstrapcdn.com'],
    scriptSrc:["'self'",'cdnjs.cloudflare.com'],
    fontSrc:["'self'", 'maxcdn.bootstrapcdn.com'],
    reportUri: '/report-violation'
  }
}));
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
var port     = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var app_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var morgan  = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser  = require('body-parser');
var redis   = require("redis");
var session   = require('express-session');
var redisStore = require('connect-redis')(session);
var redisClient  = redis.createClient();
var redisHost = process.env.OPENSHIFT_REDIS_HOST || 'localhost';
var redisPort = process.env.OPENSHIFT_REDIS_PORT || 6379;
var swig = require('swig');
var crypto = require('crypto');
var async = require('async');
var fs = require('fs');
var path = require('path');
var sender = require('superagent');
var sysInfo = require('./utils/sys-info');
var multipart = require('connect-multiparty');
var multipartyMiddleware = multipart();

var isLoggedIn = require('./app/services').isLoggedIn;
var logDir = process.env.OPENSHIFT_LOG_DIR ? process.env.OPENSHIFT_LOG_DIR : __dirname;
var accessLogStream = fs.createWriteStream(path.join(logDir, 'access.log'), {flags: 'a'});
var logger = require('./config/logger');

require('./config/passport')(passport, logger); // pass passport for configuration

// set up our express application
app.use(morgan('common',{stream:accessLogStream}));

app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // get information from html forms
// required for passport
app.use(session({
    secret: process.env.OPENSHIFT_SESSION_SECRET,
    // create new redis store.
    store: new redisStore({ host: redisHost, port: redisPort, client: redisClient, ttl :  7200}),
    saveUninitialized: false,
    resave: true,
    cookie: { maxAge:360000 },
    name:"HLPB_awesome_cookie"
  })
);

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use('/tunes/*', isLoggedIn, function(req, res, next){
    if(req.user.role !== 'admin' && req.user.role !== 'member'){
      req.flash('loginMessage', 'Your user account isn\'t approved. Contact your system administrator to get it enabled.');
      return res.redirect('/profile');
    }
    next();
});
app.use('/documents/*', isLoggedIn, function(req, res, next){
    if(req.user.role !== 'admin' && req.user.role !== 'member'){
      req.flash('loginMessage', 'Your user account isn\'t approved. Contact your system administrator to get it enabled.');
      return res.redirect('/profile');
    }
    next();
});
app.use(express.static('views'));
if(process.env.OPENSHIFT_DATA_DIR){
  app.use(express.static(process.env.OPENSHIFT_DATA_DIR));
  app.use(process.env.OPENSHIFT_DATA_DIR, isLoggedIn, function(req, res, next){next();});
}
// routes ======================================================================
require('./app/routes/login.js')(app, passport, async, crypto, sender, multipartyMiddleware, logger); // load our routes and pass in our app and fully configured passport
require('./app/routes/user.js')(app, multipartyMiddleware, fs, logger, sender);
require('./app/routes/admin.js')(app, logger); // load our routes and pass in our app and fully configured passport
require('./app/routes/files.js')(app, multipartyMiddleware, fs, logger);
require('./app/routes/tunes.js')(app, multipartyMiddleware, fs, logger);
app.get('/health',function(req,res){
  res.sendStatus(200);
});
app.get('/info/:token',(req,res,next) => {
  if(req.params.token == 'gen'|| req.params.token == 'poll'){
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store');
  res.json(JSON.stringify(sysInfo[req.params.token]()));
  } else {
    next();
  }
});
app.post('/report-violation', function (req, res) {
  if (req.body) {
    console.log('CSP Violation: ', req.body);
  } else {
    console.log('CSP Violation: No data received!');
  }
  res.status(204).end();
});
app.get('*',function(req,res){
  res.status(404).render('404');
});
app.use((err, req, res, next) => {
  logger.error(`uncaught error: ${err} , \n req.path: ${req.path}`);
  res.status(500).json({error: 'Something went wrong'}).end();
});

// launch ======================================================================
app.listen(port,app_ip_address);
console.log('The magic happens on port ' + port);
