var Document = require('../models/document'),
    User = require('../models/user');
    var {getAnnouncements} = require('../controllers/announcement');
    var {uploadFile} = require('../controllers/files');
    var {emailAdmins, emailuser} = require('../controllers/user');
    var {isLoggedIn} = require('../services');
    var path = require('path');
    var docsUploadDir = process.env.OPENSHIFT_DATA_DIR ? path.join(process.env.OPENSHIFT_DATA_DIR, '/docs/') : path.resolve(__dirname, '../../views/docs/');

module.exports = function (app, multipartyMiddleware, logger) {
    app.get('/documents', function (req, res, next) {
      getAnnouncements().catch((e)=>{logger.error(e);}).then((announcements) =>{
        Document.find({}, function (err, documents) {
            if (err) {
                logger.error(` get all documents error: ${err}`);
                return next(err);
            }
            res.render('documents', {
                documents: documents,
                active: 'documents',
                user:req.user,
                announcements:announcements
            });
        });
        });
    });

    app.get('/documents/new', function (req, res) {
        res.render('addDocument', {
            active: 'documents',
            user:req.user
        });
    });
    app.post('/documents/new', multipartyMiddleware, function (req, res, next) {
        let p = uploadFile(req.files.file, docsUploadDir)
          .then((fileData)=>{
            Document.create({
                name: req.body.name,
                file: '/docs/'+ fileData.filename
            }, function (err, document) {
                if (err) {
                    logger.error(` new docs create error: ${err}`);
                    return next(err);
                }
                res.redirect('/documents');
            });
          })
          .catch((error)=>{
            logger.error(` new docs write error: ${err}`);
            return res.status(400).send(err);
          });

      });
};
//TODO: add edit / delete routes
