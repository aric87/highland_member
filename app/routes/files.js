var Document = require('../models/document'),
    User = require('../models/user'),
    Song = require('../models/song'),
    isLoggedIn = require('../services'),
    path = require('path'),
    fileFolderPath = '../../views/tunes/',
    uploadDir = path.resolve(__dirname, fileFolderPath);

module.exports = function (app, multipartyMiddleware, fs) {
    app.get('/tunes', isLoggedIn, function (req, res) {
        Song.find({}, function (err, tunes) {
            if (err) {
                console.log(err);
                return;
            }

            console.log(tunes);
            res.render('tunes', {
                tunes: tunes,
                active: 'tunes'
            });
        });
    });

    app.get('/tunes/:name', isLoggedIn, function (req, res) {
        Song.find({
            name: req.params.name
        }, function (err, tune) {
            if (err) {
                console.log(err);
                return;
            }

            console.log(tune);
            res.render('tuneDetail', {
                user: req.user,
                tune: tune[0]
            });
        });
    });

    app.get('/tunes/edit/:name', isLoggedIn, function (req, res) {
        Song.find({
            name: req.params.name
        }, function (err, tune) {
            if (err) {
                console.log(err);
                return;
            }
            console.log(tune);
            res.render('tuneEdit', {
                tune: tune[0]
            });
        });
    });
    app.post('/tunes/update/', multipartyMiddleware, function (req, res) {
        console.log(req);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }

        fs.readFile(req.files.file.path, function (err, data) {
            var createDir = uploadDir + '/' + req.files.file.name;
            fs.writeFile(createDir, data, function (err) {
                if (err) {
                    res.status(400).send(err);
                } else {
                    Document.findOne({
                        name: req.body.name
                    }, function (err, tune) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        console.log(tune);
                        tune[req.body.tuneType] = '/tunes/' + req.files.file.name;
                        console.log(tune);
                        tune.save(function (err) {
                            res.render('tuneEdit', {
                                tune: tune[0]
                            });
                        });

                    });
                }
            });
        });

    });
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
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        fs.readFile(req.files.file.path, function (err, data) {
            var createDir = uploadDir + '/' + req.files.file.name;
            fs.writeFile(createDir, data, function (err) {
                if (err) {
                    res.status(400).send(err);
                } else {
                    Document.create({
                        name: req.body.name,
                        file: '/tunes/' + req.files.file.name
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
