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
  const event = { EVENT_DATE: new Date(), EVENT_ID: uuid.v4(), NAME: input.NAME,
  TYPE: input.TYPE, EVENT_DATE: new Date(), IS_DELETED: input.IS_DELETED};
  console.log('Request to log event:' + JSON.stringify(event));
  req.app.get('connection').query('INSERT INTO EVENTS set ?', event, function(err) {
      if (err) {
        res.send(err);
      } else {
        res.redirect('/hikes');
      }
   });
};
