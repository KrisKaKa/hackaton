const uuid = require('node-uuid');
exports.index = function(req, res) {
  res.app.get('connection').query( 'SELECT * FROM EVENTS', function(err,
rows) {
    if (err) {
      res.send(err);
    } else {
      console.log(JSON.stringify(rows));
      res.render('hike', {title: 'My Events Log', hikes: rows});
  }});
};
exports.add_hike = function(req, res){
  const input = req.body.hike;
  console.log('Request to log event req.body:'+ req.body.hike.NAME+'<-'); 
  const event = { EVENT_DATE: new Date(), EVENT_ID: uuid.v4(), NAME: input.NAME,
  TYPE: input.TYPE, CREATE_DATE: new Date(), IS_DELETED: input.IS_DELETED};
  console.log('Request to log event po nowemu:' + JSON.stringify(event));
  req.app.get('connection').query('INSERT INTO EVENTS set ?', event, function(err) {
      if (err) {
        res.send(err);
      } else {
        res.redirect('/hikes');
      }
   });
};

exports.add_ce = function(req, res){
  console.log('Request to log event-cust relation req.body:'+ req.body+'<-'); 
  //const input = JSON.parse(req.body);
const input = req.body;
  console.log('Request to log event-cust relation req.body parsed:'+ input+'<-'); 
  const ce_event = { CE_ID: uuid.v4(), EVENT_ID: input.EVENT_ID,
  CUSTOMER_STRAVA: input.CUSTOMER_STRAVA};
  console.log('Request to log event-customer:' + ce_event);
  req.app.get('connection').query('INSERT INTO CUST_EVENTS set ?', ce_event, function(err) {
      if (err) {
        res.send(err);
      } else {
        res.status(200).send('OK');
      }
   });
};


exports.events = function(req, res) {
  res.app.get('connection').query( 'SELECT * FROM EVENTS', function(err,
rows) {
      if (err) {
        res.send(err);
      } else {
        console.log(JSON.stringify(rows));
      res.status(200).send(JSON.stringify(rows))
      //res.send('events', JSON.stringify(rows));
  }}); 
};



exports.details = function(req, res) {
  console.log('Request to log details  relation req.body:'+ req.body+'<-'); 
  //const input = JSON.parse(req.body);
  const input = req.body;
  res.app.get('connection').query( 'SELECT * FROM DETAILS WHERE CUSTOMER_STRAVA='+input.CUSTOMER_STRAVA, function(err,
rows) {
    if (err) {
      res.send(err);
    } else {
      console.log(JSON.stringify(rows));
      res.status(200).send(JSON.stringify(rows))
      //res.send('events', JSON.stringify(rows));
  }}); 
};

exports.myEvents = function(req, res) {
  console.log('Request to log myEvents  relation req.body:'+ req.body+'<-'); 
  //const input = JSON.parse(req.body);
  const input = req.body;
  res.app.get('connection').
  query( 
  'SELECT E.EVENT_ID, ' +
  'E.EVENT_DATE, ' +
  'E.NAME,' +
  'E.TYPE,' + 
  'if ( E.EVENT_ID in (Select * from CUST_EVENTS where CUSTOMER_STRAVA=' +input.CUSTOMER_STRAVA +  "), 'true','false' as participate " + 
  'FROM EVENTS as E', function(err,
rows) {
    if (err) {
      res.send(err);
    } else {
      console.log(JSON.stringify(rows));
      res.status(200).send(JSON.stringify(rows))
      //res.send('events', JSON.stringify(rows));
  }}); 
};
