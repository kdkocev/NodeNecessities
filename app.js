/*jslint white: true*/

var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var login_strategies = require('./config/login-strategies');
var config = require('./config/config');

var app = express();

if (process.env.NODE_ENV === 'test') {
  mongoose.connect(process.env.TEST_DB);
} else {
  mongoose.connect(require('./config/database').url); // connect to our database
}

require('./config/passport-config')(passport);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
if (process.env.NODE_ENV !== 'test') {
  app.use(logger('dev'));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser(config.cookie_secret));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: config.session_secret,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

app.use(login_strategies.check_remember_me);

// Routes
require('./routes/index')(app, passport);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;