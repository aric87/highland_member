var Page = require('../models/page'),
    User = require('../models/user'),
    Song = require('../models/song'),
    Band = require('../models/band'),
    Event = require('../models/event'),
    Venue = require('../models/venue'),
    {uploadFile} = require('../controllers/files'),
    {isLoggedIn} = require('../services'),
    path = require('path');

module.exports = function pagesInit(app, multipartyMiddleware, fs, logger) {
	app.get('/members/admin/pages', isLoggedIn, (req, res, next) => {
    Band.populate(req.band, { path: 'contentPages'}, (err, filledBand) => {
    return res.render(`common/pages/pages`,{
      band:req.band,
      active: 'admin',
      user: req.user,
      pageContent:filledBand.contentPages,
      page:'list',
    });

	   });
  });
	app.get('/members/admin/pages/new', isLoggedIn, (req, res, next) => {

		return res.render(`common/pages/pages`,{
      band:req.band,
      active: 'admin',
      user: req.user,
      page:'new',
		});
	});

	app.post('/members/admin/pages/new', isLoggedIn, (req, res, next) => {
		var pages = '';
		const clientProm = new Promise ((resolve, reject)=> {
      Band.populate(req.band, { path: 'contentPages'}, (err, filledBand) => {
				if(err){
					return reject(err)
				}
        var filteredPages = filledBand.contentPages.filter((page) => {
          return page.url == req.body.url
        })
				if(filteredPages.length){
					return reject({message:'This Url already exists.', status: 400})
				}
				 return resolve(filledBand);
			})
		})
		clientProm.then(() => {
			return new Promise((resolve, reject)=>{
				let newPage = {
					name: req.body.name,
					url: req.body.url,
					page_css: req.body.page_css,
					content: req.body.content,
					active: req.body.active
				};
				Page.create(newPage,(err, page) => {
					if(err){
						return reject(err)
					}
					resolve(page);
				})
			});
		}).then((page) => {

			req.band.contentPages = [].concat(req.band.contentPages,page);
			req.band.save((err) => {
        console.log('getting here')
				if(err){
					return next(err)
				}
				return res.redirect(`/members/admin/pages`);
			})
		}).catch((e)=>{
      console.log(e)
			return next(e);
		})

	});

	app.get('/members/admin/pages/:page',isLoggedIn, (req, res, next) => {
    Band.populate(req.band, { path: 'contentPages', match:{'url':req.params.page}}, (err, filledBand) => {
			if(err){
				return next(err);
			}
			if(!filledBand.contentPages.length){
				return res.render(`/members/admin/pages`,{
            band:req.band,
            active: 'admin',
            user: req.user,
            page:'new',
						message: 'Page does not exist.'
				});
			}
			return res.render(`common/pages/pages`,{
          band:req.band,
          active: 'admin',
          user: req.user,
					page:'edit',
					pageContent: filledBand.contentPages[0]
			});
		})

	});
	app.post('/members/admin/pages/:page', isLoggedIn, (req, res, next) => {
		if(req.body.action === 'delete'){
      Band.populate(req.band, { path: 'contentPages', match:{'url':req.params.page}}, (err, filledBand) => {
				if(err){
					return next(err);
				}
				const pageProm = new Promise ((resolve, reject)=> {
					Page.remove({_id:filledBand.contentPages[0]._id}, (err) => {
						if(err){
							return reject(err)
						}
						 return resolve();
					})

				})
			pageProm.then(() =>{
				Band.update(req.band, {$pull:{pages:filledBand.contentPages[0]._id}}, (err, refilledBand) => {
					if (err){
						console.log(err);
						return next(err);
					}
					return res.render(`common/pages/pages`,{
            band:req.band,
            active: 'admin',
            user: req.user,
            page:'new',
            message: "Page deleted"
					});
				})
			})

		})
	} else {
    console.log(req.body)
    if(!req.body.active){
      req.body.active = false;
    }
		Page.findOneAndUpdate({'_id':req.body.id },req.body, (err, page) => {
			console.log('page ',page)
				if(err){
					return next({message:err, status:500})
				}
				return res.redirect(`/members/admin/pages/${req.body.url}`);

			})
	}

	});

}
