var Document = require('../models/document'),
    User = require('../models/user'),
    isLoggedIn = require('../services'),
    path = require('path'),
    docsUploadDir = path.resolve(__dirname, '../../views/documents/');

module.exports = function (app, multipartyMiddleware, fs) {
    app.get('/documents', isLoggedIn, function (req, res) {
        Document.find({}, function (err, documents) {
            if (err) {
                console.log(err);
                return;
            }
            res.render('documents', {
                documents: documents,
                active: 'documents'
            });
        });
    });
    app.get('/documents/new', isLoggedIn, function (req, res) {
        res.render('addDocument', {
            active: 'documents'
        });
    });
    app.post('/documents/new', multipartyMiddleware, function (req, res) {
        if (!fs.existsSync(docsUploadDir)) {
            fs.mkdirSync(docsUploadDir);
        }
        fs.readFile(req.files.file.path, function (err, data) {
            var createDir = docsUploadDir + '/' + req.files.file.name;
            fs.writeFile(createDir, data, function (err) {
                if (err) {
                    res.status(400).send(err);
                } else {
                    Document.create({
                        name: req.body.name,
                        file: '/documents/' + req.files.file.name
                    }, function (err, document) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        res.redirect('/documents');
                    });
                }
            });
        });

    });
};
//TODO: add edit / delete routes
