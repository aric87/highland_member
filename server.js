// get all the tools we need
require('./config/connect');
var express  = require('express');
var helmet = require('helmet');
var csp = require('helmet-csp');
var app      = express();
var uuid = require('node-uuid');
app.use(helmet());
app.use(function (req, res, next) {
  res.locals.nonce = uuid.v4();
  next();
});
app.use(csp({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", 'maxcdn.bootstrapcdn.com','cdnjs.cloudflare.com',function (req, res) {
        return "'nonce-" + res.locals.nonce + "'";
      }],
    scriptSrc:["'self'",'cdnjs.cloudflare.com'],
    fontSrc:["'self'", 'maxcdn.bootstrapcdn.com'],
    reportUri: '/report-violation'
  }
}));
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
var port  = 8081;
// var port     = 8081;
var app_ip_address = '127.0.0.1';
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var morgan  = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser  = require('body-parser');
var redis   = require("redis");
var session   = require('express-session');
var redisStore = require('connect-redis')(session);
var redisHost = 'localhost';
var redisPort = 6379;
var redisClient  = redis.createClient({host: redisHost, port: redisPort});
if(process.env.REDIS_PASSWORD){
  redisClient.auth(process.env.REDIS_PASSWORD);
}
var swig = require('swig');
var crypto = require('crypto');
var async = require('async');
var fs = require('fs');
var path = require('path');
var sender = require('superagent');
var multipart = require('connect-multiparty');
var os = require('os');
var multipartyMiddleware = multipart({uploadDir:os.tmpdir()});

var isLoggedIn = require('./app/services').isLoggedIn;
var logDir =  process.env.LOGDIR ?  process.env.LOGDIR : __dirname;
var accessLogStream = fs.createWriteStream(path.join(logDir, 'access.log'), {flags: 'a'});
var logger = require('./config/logger');
var BandModel = require('./app/models/band');
require('./config/passport')(passport, logger); // pass passport for configuration

// set up our express application
app.use(morgan('common',{stream:accessLogStream}));

app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // get information from html forms
// required for passport
var rStore = new redisStore({ host: redisHost, port: redisPort, client: redisClient, ttl :  72000,logErrors:true});
app.use(session({
    secret: process.env.SESSION_SECRET,
    // create new redis store.
    store: rStore,
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge:360000 },
    name:"HLPB_awesome_cookie"
  })
);


// limit requests per hour
const limiter = require('express-limiter')(app, redisClient);
limiter({
  lookup: ['connection.remoteAddress'],
  total: 20,
  expire: 1000 * 120
});
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views/templates');
app.use('*', function(req, res, next){
  if(!req.headers.band){
    return next(new Error('No band in header'));
  }
  BandModel.findOne({bandCode:req.headers.band}, function(err, band){
    if(err || !band){
      err = err || "no band";
      return next(new Error(err));
    }
    req.band = band;
    req.band.nonce = res.locals.nonce;
    next();
  });
});
app.use(express.static('views'));
if(process.env.DATADIR){
  app.use(express.static(process.env.DATADIR));
  app.use(process.env.DATADIR, isLoggedIn, function(req, res, next){next();});
}
// routes ======================================================================
require('./app/routes/login.js')(app, passport, async, crypto, sender, multipartyMiddleware, logger); // load our routes and pass in our app and fully configured passport
require('./app/routes/user.js')(app, multipartyMiddleware, fs, logger, sender);
require('./app/routes/admin.js')(app, logger); // load our routes and pass in our app and fully configured passport
require('./app/routes/files.js')(app, multipartyMiddleware, logger);
require('./app/routes/tunes.js')(app, multipartyMiddleware, fs, logger);
require('./app/routes/tunesets.js')(app, multipartyMiddleware, fs, logger);
require('./app/routes/events.js')(app, multipartyMiddleware, fs, logger);
app.post('/report-violation', function (req, res) {
  if (req.body) {
    console.log('CSP Violation: ', req.body);
  } else {
    console.log('CSP Violation: No data received!');
  }
  res.status(204).end();
});
app.get('*',function(req,res){
  res.status(404).render('common/404',{band:req.band,user:req.user});
});
app.use((err, req, res, next) => {
  logger.error(`uncaught error: ${err} , \n req.path: ${req.path}`);
  res.status(500).json({error: 'Something went wrong'}).end();
});

// launch ======================================================================
app.listen(port,app_ip_address);
console.log('The magic happens on port ' + port);
