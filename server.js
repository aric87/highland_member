// get all the tools we need
require('./config/connect');
const express = require('express');
const helmet = require('helmet');
const csp = require('helmet-csp');

const app = express();
const uuid = require('node-uuid');

app.set('trust proxy', true);
app.use(helmet());
app.use((req, res, next) => {
	res.locals.nonce = uuid.v4();
	next();
});
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
const port = 8081;
const appIpAddress = '127.0.0.1';
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const redis = require('redis');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

const redisHost = 'localhost';
const redisPort = 6379;
const redisClient = redis.createClient({ host: redisHost, port: redisPort });
if (process.env.REDIS_PASSWORD) {
	redisClient.auth(process.env.REDIS_PASSWORD);
}
const swig = require('swig');
const crypto = require('crypto');
const async = require('async');
const fs = require('fs');
const path = require('path');
const sender = require('superagent');
const multipart = require('connect-multiparty');
const os = require('os');

const multipartyMiddleware = multipart({ uploadDir: os.tmpdir() });
const isLoggedIn = require('./app/services').isLoggedIn;

const logDir = process.env.LOGDIR ? process.env.LOGDIR : __dirname;
const accessLogStream = fs.createWriteStream(path.join(logDir, 'access.log'), { flags: 'a' });
const logger = require('./config/logger');
const BandModel = require('./app/models/band');
require('./config/passport')(passport, logger); // pass passport for configuration

// set up our express application
app.use(morgan('common', { stream: accessLogStream }));
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // get information from html forms
// required for passport
const rStore = new RedisStore({
	host: redisHost,
	port: redisPort,
	client: redisClient,
	logErrors: true,
});
app.use(session({
	secret: process.env.SESSION_SECRET,
	// create new redis store.
	store: rStore,
	saveUninitialized: false,
	resave: false,
	cookie: { maxAge: 1800000 },
	name: 'HLPB_awesome_cookie',
})
);
// limit requests per hour
const limiter = require('express-limiter')(app, redisClient);

limiter({
	lookup: ['connection.remoteAddress'],
	total: 20,
	expire: 1000 * 120,
});
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', `${__dirname}/views/templates`);
app.use('*', (req, res, next) => {
	req.headers.band  = 'hlpb';
	if (!req.headers.band) {
		return next(new Error('No band in header'));
	}
	BandModel.findOne({ bandCode: req.headers.band }, (err, band) => {
		if (err || !band) {
			err = err || 'no band';
			return next(new Error(err));
		}
		req.band = band;
		return next();
	});
});
app.get('/:band/tunes/:tune', isLoggedIn, (req, res, next) => next());
app.get('/:band/docs/:doc', isLoggedIn, (req, res, next) => next());
app.get('/:band/profileImages/:doc', isLoggedIn, (req, res, next) => next());
app.use(express.static('views'));
if (process.env.DATADIR) {
	app.use(express.static(process.env.DATADIR));
}

// routes ======================================================================
require('./app/routes/public.js')(app, logger);
require('./app/routes/login.js')(app, passport, async, crypto, sender, multipartyMiddleware, logger); // load our routes and pass in our app and fully configured passport
require('./app/routes/user.js')(app, multipartyMiddleware, fs, logger, sender);
require('./app/routes/admin.js')(app, logger); // load our routes and pass in our app and fully configured passport
require('./app/routes/files.js')(app, multipartyMiddleware, logger);
require('./app/routes/tunes.js')(app, multipartyMiddleware, fs, logger);
require('./app/routes/tunesets.js')(app, multipartyMiddleware, fs, logger);
require('./app/routes/events.js')(app, multipartyMiddleware, fs, logger);
require('./app/routes/cms.js')(app, multipartyMiddleware, fs, logger);

app.post('/report-violation', (req, res) => {
	if (req.body) {
		logger.info('CSP Violation: ', req.body);
	} else {
		logger.info('CSP Violation: No data received!');
	}
	return res.status(204).end();
});
app.get('*', (req, res) => res.status(404).render('common/404', { band: req.band, user: req.user }));
app.post('*', (req, res) => res.status(404).render('common/404', { band: req.band, user: req.user }));

app.use((err, req, res) => {
	for (var key in err){
		let tempErr = err[key]
		if(typeof tempErr === "object"){
			for (var innerKey in tempErr)
			{
				logger.error(`uncaught error: ${tempErr[innerKey]} , \n req.path: {req.path}`);
			}
		} else {
			logger.error(`uncaught error: ${tempErr} , \n req.path: {req.path}`);
		}

	}

	return res.status(500).json({ error: 'Something went wrong' }).end();
});

// launch ======================================================================
app.listen(port, appIpAddress);
