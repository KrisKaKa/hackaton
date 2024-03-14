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
  console.log('zaczynam!')
  app.get('/', routes.index);
  console.log('routes!')
  app.get('/users', user.list);
  console.log('users!')
  app.get('/hikes', hike.index);
  console.log('hikes!')
  app.post('/add_hike', hike.add_hike);
  console.log('add hike!')

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
     client.query('CREATE TABLE HIKES (' +
                         'ID VARCHAR(40), ' +
                         'HIKE_DATE DATE, ' +
                         'NAME VARCHAR(40), ' +
                         'DISTANCE VARCHAR(40), ' +
                         'LOCATION VARCHAR(40), ' +
                         'WEATHER VARCHAR(40), ' +
                         'PRIMARY KEY(ID))', callback);
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
  function insert_default(callback) {
    const hike = {HIKE_DATE: new Date(), NAME: 'Hazard Stevens',
          LOCATION: 'Mt Rainier', DISTANCE: '4,027m vertical', WEATHER:'Bad', ID: '12345'};
    client.query('INSERT INTO HIKES set ?', hike, callback);
  },
  function insert_default2(callback) {
    const eventstrava = {EVENT_DATE: new Date(), NAME: 'Biegnij Warszawo',
          TYPE: 'Running', CREATE_DATE: new Date(), IS_DELETED: false, EVENT_ID: '12345'};
    client.query('INSERT INTO EVENTS set ?', eventstrava, callback);
    console.log('dodalem rekordy do bazy')
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
