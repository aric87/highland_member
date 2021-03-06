var User = require('../models/user'),
    Song = require('../models/song'),
    Band = require('../models/band'),
    Event = require('../models/event'),
    Venue = require('../models/venue'),
    {uploadFile} = require('../controllers/files'),
    {isLoggedIn} = require('../services'),
    path = require('path'),
    tunesUploadDir = process.env.DATADIR ? process.env.DATADIR : path.resolve(__dirname, '../../views/');

module.exports = function (app, multipartyMiddleware, fs, logger) {
    app.get('/members/events',isLoggedIn,(req, res, next)=>{
      var popEvents;
      if(!req.query.filter ||req.query.filter == 'future' ){
        var date = new Date(Date.now());
        var formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
        popEvents = {path:'events',match:{date:{'$gte':new Date(formattedDate)}}}
      } else {
        popEvents = {path:'events'}
      }
      Band.populate(req.band,[{path:'announcements',match:{'showPrivate':true,active:true}},
      {path:'venues', populate:popEvents}], function (err, band) {
          if (err) {
            logger.error(` /music song find err: ${err}`);
            return next(err);
          }
          var sorted_venues = [];
          band.venues.forEach((venue)=>{
            venue.events.forEach((event)=>{
              newVenue = {
                venueName:venue.name,
                eventDate:new Date(event.date).toString(),
                venueId:venue.id,
                eventId:event.id

              };
              sorted_venues.push(newVenue);
            });
          })
          sorted_venues = sorted_venues.sort(function(a,b){
            return a.eventDate > b.eventDate;
          });
          res.render('common/events', {
              band:band,
              active: 'events',
              announcements:band.announcements,
              user:req.user,
              venues:sorted_venues
          });
      });
    });
    app.get('/members/events/new',isLoggedIn,(req, res, next)=>{
      Band.populate(req.band,[{path:'announcements',match:{'showPrivate':true,active:true}},{path:'venues'}], function (err, band) {
          if (err) {
            logger.error(` /music song find err: ${err}`);
            return next(err);
          }
          res.render('common/addEvent', {
              band:band,
              active: 'events',
              announcements:band.announcements,
              user:req.user,
              venues:band.venues
          });
      });
    });
    app.post('/members/events/new',isLoggedIn, multipartyMiddleware,(req, res, next)=>{
        var ven = new Promise((resolve, reject)=>{
          if(req.body.venue == 'new'){
            var newVenue = {
              name:req.body.venueName,
              location:req.body.venueLocation,
              description:req.body.venueDescription,
              address:req.body.venueAddress,
              band:req.band._id
            };
            Venue.create(newVenue, (err, venue) => {
                if (err) {
                  logger.error(`Venue create err: ${err}, band ${req.band.name}`);
                  return reject(err);
                }
                console.log(req.band.venues)
                req.band.venues = [].concat(req.band.venues,venue);
                req.band.save(function(err){
                  if(err){
                    return next(err);
                  }
                resolve(venue);
                });
              });
          } else{
            Band.populate(req.band, {path:'venues',match:{'_id':req.body.venue}},(err,band) =>{
              if(err){
                  return reject(err)
              }
              resolve(band.venues[0])
            })
          }
        });

        ven.then((venue)=>{
          console.log(req.body.eventDate);
          console.log(new Date(req.body.eventDate))
          var newEvent = {
            date:new Date(req.body.eventDate),
            description:req.body.eventDescription,
            uniform:req.body.eventUniform,
            venue:venue._id,
            band:req.band._id
          };
          Event.create(newEvent, (err,event)=>{
            if (err) {
              logger.error(`Venue create err: ${err}, band ${req.band.name}`);
              return next(err);
            }
            console.log('ven ',venue)
            venue.events = [].concat(venue.events, event._id);
            venue.save((err)=>{
              if(err){
                return next(err);
              }
              res.redirect('/members/events');
            });
          });
        }).catch((err)=>{
          next(err);
        });
      });
      app.get('/members/event/venue',isLoggedIn,(req, res, next)=>{
        Band.populate(req.band,[{path:'announcements',match:{'showPrivate':true,active:true}},{path:'venues',match:{_id:req.query.id},populate:{path:'events'}}], function (err, band) {
            if (err) {
              logger.error(` /music song find err: ${err}`);
              return next(err);
            }
            if(!band.venues.length){
              return next();
            }
            res.render('common/venueDetail', {
                band:band,
                active: 'events',
                announcements:band.announcements,
                user:req.user,
                venue:band.venues[0]
            });
        });
      });

      app.get('/members/event/venue/edit',isLoggedIn,(req, res, next)=>{
        Band.populate(req.band,[{path:'announcements',match:{'showPrivate':true,active:true}},{path:'venues',match:{_id:req.query.id},populate:{path:'events'}}], function (err, band) {
            if (err) {
              logger.error(` /music song find err: ${err}`);
              return next(err);
            }
            if(!band.venues.length){
              return next();
            }
            res.render('common/venueEdit', {
                band:band,
                active: 'events',
                announcements:band.announcements,
                user:req.user,
                venue:band.venues[0]
            });
        });
      });
      app.post('/members/event/venue/edit',isLoggedIn,(req, res, next)=>{
        Band.populate(req.band,[{path:'announcements',match:{'showPrivate':true,active:true}},{path:'venues',match:{_id:req.body.id},populate:{path:'events'}}], function (err, band) {
            if (err) {
              logger.error(` /music song find err: ${err}`);
              return next(err);
            }
            if(!band.venues.length){
              return next(500);
            }

              band.venues[0].name=req.body.venueName;
              band.venues[0].location=req.body.location;
              band.venues[0].description=req.body.description;
              band.venues[0].address=req.body.address;

              band.venues[0].save((err)=>{
                if(err){
                  return next(err)
                }
                  res.redirect(`/members/event/venue?id=${band.venues[0].id}`);
              })

        });
      });
      app.get('/members/event/eventDetail',isLoggedIn,(req, res, next)=>{
        Band.populate(req.band,[{path:'announcements',match:{'showPrivate':true,active:true}},{path:'venues', match:{_id:req.query.id},populate:{path:'events',match:{_id:req.query.event}}}], function (err, band) {
            if (err) {
              logger.error(` /music song find err: ${err}`);
              return next(err);
            }
            res.render('common/eventDetail', {
                band:band,
                active: 'events',
                announcements:band.announcements,
                user:req.user,
                venue:band.venues[0],
                event:band.venues[0].events[0]
            });
        });
      });
      app.get('/members/event/edit',isLoggedIn,(req, res, next)=>{
        Band.populate(req.band,[{path:'announcements',match:{'showPrivate':true,active:true}},{path:'venues', match:{_id:req.query.id},populate:{path:'events',match:{_id:req.query.event}}}], function (err, band) {
            if (err) {
              logger.error(` /music song find err: ${err}`);
              return next(err);
            }
            res.render('common/eventEdit', {
                band:band,
                active: 'events',
                announcements:band.announcements,
                user:req.user,
                venue:band.venues[0],
                event:band.venues[0].events[0]
            });
        });
      });
      app.post('/members/event/edit',isLoggedIn,(req, res, next)=>{
        Band.populate(req.band,[{path:'announcements',match:{'showPrivate':true,active:true}},{path:'venues', match:{_id:req.params.venueId},populate:{path:'events',match:{_id:req.params.eventId}}}], function (err, band) {
            if (err) {
              logger.error(` /music song find err: ${err}`);
              return next(err);
            }
            var event = band.venues[0].events[0];
            event.date = new Date(req.body.eventDate);
            event.uniform = req.body.eventUniform;
            event.description = req.body.eventDescription;

            event.save((err)=>{
              if(err){
                return next(err)
              }
            res.redirect(`/members/event/eventDetail?id=${band.venues[0].id}&event=${band.venues[0].events[0].id}`);
            })

        });
      });
};
