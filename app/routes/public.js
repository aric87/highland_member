const Band = require('../models/band');
const { emailAdmins } = require('../controllers/user');

module.exports = function publicRoutes(app, logger) {
	app.get('/', (req, res) => {
		if (req.band.privateOnly) {
			return res.redirect('/login');
		}
		const populationQuery = [{
			path: 'announcements',
			match: {
				showPublic: true,
				active: true,
			},
		}];
		Band.populate(req.band, populationQuery, (err, band) =>
			res.render(`${req.band.bandCode}/index`, {
				band: req.band,
				announcements: band.announcements,
			})
		);
	});

	app.get('/:slug', (req, res, next) => {
		if (req.band.publicPages.indexOf(req.params.slug.toLowerCase()) < 0) {
			return next();
		}
		if (req.band.privateOnly) {
			return res.redirect('/login');
		}
		const populationQuery = [{
			path: 'announcements',
			match: {
				showPublic: true,
				active: true,
			},
		}];
		Band.populate(req.band, populationQuery, (err, band) =>
			res.render(`${req.band.bandCode}/${req.params.slug}`, {
				band: req.band,
				announcements: band.announcements,
				page: req.params.slug.toLowerCase(),
			})
			);
	});
	app.post('/contact-form', (req, res) => {
		const subject = 'A new submission from your contact form';
		const content = `
			You've received a new submission on the band website from: ${req.body.contact_name}.\n
			You should reply promptly to them at: ${req.body.contact_email}\n
			Their message to you: \n
			${req.body.contact_text}
		`;
		const p = emailAdmins(subject, content, req.band);
		p.then(() => res.sendStatus(200))
		.catch(err => res.status(500).json({ message: err }).end());
	});
};
