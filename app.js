/**
 * Module dependencies.
 */

const express = require('express')
  , routes = require('./routes')
  , hike = require('./routes/hike')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , mysql = require('mysql')
  , async = require('async')
  , bodyParser = require('body-parser')
  , methodOverride = require('method-override')
  , morgan = require('morgan')
  , errorhandler = require('errorhandler');

  const uuid = require('node-uuid');

const { connect } = require('http2');

const app = express()

app.set('port', process.env.PORT || 3000)
app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(methodOverride())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))


if (process.env.NODE_ENV === 'production') {
  console.log('Attempting to create connection to production database');
  app.set('connection', mysql.createConnection({
    host: 'database-2.cnowik0msdmv.eu-central-1.rds.amazonaws.com',//process.env.RDS_HOSTNAME,
    user: 'admin',//process.env.RDS_USERNAME,
    password: 'alamakota1',//process.env.RDS_PASSWORD,
    port: 3306})); //process.env.RDS_PORT}));  
} else {
  console.log('Attempting to create connection to development database');
  // TODO: Place local mysql connection information here. You need to have mysql running locally on your machine for this example to work
  app.set('connection', mysql.createConnection({
    host: 'database-2.cnowik0msdmv.eu-central-1.rds.amazonaws.com',
    user: 'admin',
    port: 3306,
    password: 'alamakota1'}));
}

function init() {
  console.log('dodaje app JSON!')
  app.use(express.json());
  console.log('zaczynam!')
  app.get('/', routes.index);
  console.log('routes!')
  app.get('/users', user.list);
  console.log('users!')
  app.get('/hikes', hike.index);
  console.log('hikes!')
  app.post('/add_hike', hike.add_hike);
  console.log('add hike!')
  app.post('/add_ce', hike.add_ce);
  console.log('add/joint event!')
  app.get('/events', hike.events);
  console.log('eventss!')
  app.get('/details2', hike.details2);
  console.log('druga wersja details z wolaniem API!')
  app.get('/details', hike.details);
  app.post('/details', hike.details);
  console.log('details!')
  app.post('/myEvents', hike.myEvents);
  app.get('/myEvents', hike.myEvents);
  console.log('myevents!')

  http.createServer(app).listen(8080, function(){
    console.log("Express server listening on port " + 8080);
  });

  console.log('serwer czy działa?!')

  if (process.env.NODE_ENV === 'development') {
    // only use in development environment
    app.use(morgan('dev'));
    app.use(errorhandler('dev'))
  }
}

const client = app.get('connection');
async.series([
  function connect(callback) {
    client.connect(callback);
    console.log('Connected!');
  },
  function clear(callback) {
    client.query('DROP DATABASE IF EXISTS mynode_db', callback);
  },
  function create_db(callback) {
    client.query('CREATE DATABASE mynode_db', callback);
  },
  function use_db(callback) {
    client.query('USE mynode_db', callback);
  },
  function create_table(callback) {
     client.query('CREATE TABLE CUST_EVENTS (' +
                         'CE_ID VARCHAR(40), ' +
                         'EVENT_ID VARCHAR(40), ' +
                         'CUSTOMER_STRAVA VARCHAR(40), ' +
                         'PRIMARY KEY(CE_ID))', callback);
  },
  function create_table2(callback) {
    client.query('CREATE TABLE EVENTS (' +
                        'EVENT_ID VARCHAR(40), ' +
                        'EVENT_DATE DATE, ' +
                        'NAME VARCHAR(40), ' +
                        'TYPE VARCHAR(40), ' +
                        'CREATE_DATE DATE, ' +
                        'IS_DELETED BOOL, ' +
                        'PRIMARY KEY(EVENT_ID))', callback);
 },
 function create_table3(callback) {
  client.query('CREATE TABLE DETAILS (' +
                      'DETAILS_ID VARCHAR(40), ' +
                      'EVENT_ID VARCHAR(40), ' +
                      'CUSTOMER_STRAVA VARCHAR(40), ' +
                      'TYPE VARCHAR(40), ' +
                      'NUMBER_LEFT INT,' +
                      'SI VARCHAR(40), ' +
                      'DAYS_LEFT INT,' +
                      'HOURS_LEFT INT,' +
                      'MINUTES_LEFT INT,' +
                      'PRIMARY KEY(DETAILS_ID))', callback);
},
  function insert_default(callback) {
    const hike = {CUSTOMER_STRAVA: '32299812', EVENT_ID:'bbbccda7-d6a1-461e-aec2-315ca8a07eb4', CE_ID: '12345'};
    client.query('INSERT INTO CUST_EVENTS set ?', hike, callback);
    console.log('dodalem powizanie klient - event  do bazy')
  },
  function insert_default2(callback) {
    var eventstrava = {EVENT_DATE: new Date(), NAME: 'Biegnij Warszawo',
          TYPE: 'Running', CREATE_DATE: new Date(), IS_DELETED: false, EVENT_ID: 'bbbccda7-d6a1-461e-aec2-315ca8a07eb4'};
    client.query('INSERT INTO EVENTS set ?', eventstrava, callback);
    console.log('dodalem rekordy do bazy')
  },
  function insert_default3(callback) {
     var eventstrava = {EVENT_DATE: new Date(), NAME: 'Biking in Beskidy',
          TYPE: 'Biking', CREATE_DATE: new Date(), IS_DELETED: false, EVENT_ID: 'bbbccda7-d6a1-461e-aec2-315ca8a07eb5'};
    client.query('INSERT INTO EVENTS set ?', eventstrava, callback);
    console.log('dodalem rekordy do bazy');
  }
  ,
  function insert_default6(callback) {
    var eventstrava = {EVENT_DATE: new Date(), NAME: 'Wings For Life',
          TYPE: 'Running', CREATE_DATE: new Date(), IS_DELETED: false, EVENT_ID: 'bbbccda7-d6a1-461e-aec2-315ca8a07eb6'};
    client.query('INSERT INTO EVENTS set ?', eventstrava, callback);
    console.log('dodalem rekordy do bazy')
  },
  function insert_default7(callback) {
     var eventstrava = {EVENT_DATE: new Date(), NAME: 'Spring Run in Park Slaski',
          TYPE: 'Running', CREATE_DATE: new Date(), IS_DELETED: false, EVENT_ID: 'bbbccda7-d6a1-461e-aec2-315ca8a07eb7'};
    client.query('INSERT INTO EVENTS set ?', eventstrava, callback);
    console.log('dodalem rekordy do bazy');
  }
  ,
  function insert_default4(callback) {
    var detail = {DETAILS_ID: uuid.v4(), CUSTOMER_STRAVA: '32299812', TYPE: 'Running', NUMBER_LEFT:5, SI: 'km', EVENT_ID: 'bbbccda7-d6a1-461e-aec2-315ca8a07eb4', DAYS_LEFT: 2, HOURS_LEFT: 4, MINUTES_LEFT:55};
    client.query('INSERT INTO DETAILS set ?', detail, callback);
    console.log('dodalem rekordy do bazy DETAILS')
  },
  function insert_default5(callback) {
      var detail = {DETAILS_ID: uuid.v4(), CUSTOMER_STRAVA: '32299812', TYPE: 'Biking', NUMBER_LEFT:16, SI: 'km', EVENT_ID: 'bbbccda7-d6a1-461e-aec2-315ca8a07eb5', DAYS_LEFT: 0, HOURS_LEFT: 3, MINUTES_LEFT:45};
    client.query('INSERT INTO DETAILS set ?', detail, callback);
    console.log('dodalem rekordy do bazy DETAILS')
  }
  ,
  function insert_default8(callback) {
    var detail = {DETAILS_ID: uuid.v4(), CUSTOMER_STRAVA: '32299812', TYPE: 'Running', NUMBER_LEFT:10, SI: 'km', EVENT_ID: 'bbbccda7-d6a1-461e-aec2-315ca8a07eb6', DAYS_LEFT: 22, HOURS_LEFT: 11, MINUTES_LEFT:5};
    client.query('INSERT INTO DETAILS set ?', detail, callback);
    console.log('dodalem rekordy do bazy DETAILS')
  },
  function insert_default9(callback) {
      var detail = {DETAILS_ID: uuid.v4(), CUSTOMER_STRAVA: '2598605', TYPE: 'Running', NUMBER_LEFT:6, SI: 'km', EVENT_ID: 'bbbccda7-d6a1-461e-aec2-315ca8a07eb4', DAYS_LEFT: 2, HOURS_LEFT: 4, MINUTES_LEFT:55};
    client.query('INSERT INTO DETAILS set ?', detail, callback);
    console.log('dodalem rekordy do bazy DETAILS')
  },
  function insert_default10(callback) {
      var detail = {DETAILS_ID: uuid.v4(), CUSTOMER_STRAVA: '2598605', TYPE: 'Running', NUMBER_LEFT:4, SI: 'km', EVENT_ID: 'bbbccda7-d6a1-461e-aec2-315ca8a07eb7', DAYS_LEFT: 1, HOURS_LEFT: 17, MINUTES_LEFT:3};
    client.query('INSERT INTO DETAILS set ?', detail, callback);
    console.log('dodalem rekordy do bazy DETAILS')
  },
  function insert_default11(callback) {
      var detail = {DETAILS_ID: uuid.v4(), CUSTOMER_STRAVA: '2598605', TYPE: 'Other', NUMBER_LEFT:10, SI: 'h', EVENT_ID: 'bbbccda7-d6a1-461e-aec2-315ca8a07eb8', DAYS_LEFT: 12, HOURS_LEFT: 3, MINUTES_LEFT:21};
    client.query('INSERT INTO DETAILS set ?', detail, callback);
    console.log('dodalem rekordy do bazy DETAILS')
  }
], function (err, results) {
  if (err) {
    console.log('Exception initializing database.');
    throw err;
  } else {
    console.log('Database initialization complete.');
    init();
  }
});
