var Document = require('../models/document'),
    User = require('../models/user'),
    {isLoggedIn, getAnnouncements} = require('../services'),
    path = require('path'),
    docsUploadDir = process.env.OPENSHIFT_DATA_DIR ? path.join(process.env.OPENSHIFT_DATA_DIR, '/docs/') : path.resolve(__dirname, '../../views/docs/');

module.exports = function (app, multipartyMiddleware, fs, logger) {
    app.get('/documents', function (req, res, next) {
      getAnnouncements().then(function(announcements){
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
        if (!fs.existsSync(docsUploadDir)) {
            fs.mkdirSync(docsUploadDir);
        }
        fs.readFile(req.files.file.path, function (err, data) {
            if(err){
                logger.error(` new docs read error: ${err}`);
                return res.status(400).send(err);
            }
            var createDir = docsUploadDir + '/'+ Date.now() + req.files.file.name;
            fs.writeFile(createDir, data, function (err) {
                if (err) {
                    logger.error(` new docs write error: ${err}`);
                    return res.status(400).send(err);
                } else {
                    Document.create({
                        name: req.body.name,
                        file: 'docs/'+ Date.now() +req.files.file.name
                    }, function (err, document) {
                        if (err) {
                            logger.error(` new docs create error: ${err}`);
                            return next(err);
                        }
                        res.redirect('/documents');
                    });
                }
            });
        });


    });
};
//TODO: add edit / delete routes
