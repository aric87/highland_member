var Document = require('../models/document'),
    User = require('../models/user');
    Band = require('../models/band');
    var {getAnnouncements} = require('../controllers/announcement');
    var {uploadFile} = require('../controllers/files');
    var {emailAdmins, emailuser} = require('../controllers/user');
    var {isLoggedIn} = require('../services');
    var path = require('path');
    var docsUploadDir = process.env.DATADIR ? process.env.DATADIR : path.resolve(__dirname, '../../views/');

module.exports = function (app, multipartyMiddleware, logger) {
    app.get('/documents', isLoggedIn, function (req, res, next) {
        Band.populate(req.band,[{path:'documents'},{path:'announcements',match:{'showPrivate':true,active:true}}],function (err, band) {
            if (err) {
                logger.error(` get all documents error: ${err}`);
                return next(err);
            }
            res.render('common/documents', {
                band:req.band,
                documents: band.documents,
                active: 'documents',
                user:req.user,
                announcements:band.announcements
            });
        });
      });

    app.get('/documents/new', isLoggedIn,function (req, res) {
        res.render('common/addDocument', {
            band:req.band,
            active: 'documents',
            user:req.user
        });
    });
    app.post('/documents/new', multipartyMiddleware, function (req, res, next) {
        let p = uploadFile(req.files.file, docsUploadDir+ '/'+ req.band.bandCode +'/docs/')
          .then((fileData)=>{
            Document.create({
                name: req.body.name,
                file: '/'+ req.band.bandCode +'/docs/'+ fileData.filename
            }, function (err, document) {
                if (err) {
                    logger.error(` new docs create error: ${err}`);
                    return next(err);
                }
                req.band.documents.push(document._id);
                req.band.save(function(err){
                  if (err) {
                      logger.error(` new docs add to band error: ${err}`);
                      return next(err);
                  }
                  res.redirect('/documents');
                });

            });
          })
          .catch((error)=>{
            logger.error(` new docs write error: ${err}`);
            return res.status(400).send(err);
          });

      });
};
//TODO: add edit / delete routes
