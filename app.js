/**
 *  Eischied
 *  
 *  An open source web app start kit using a MEAN stack and Jade Templating forked 
 *  from the excellent Hackathon Starter Project (https://github.com/sahat/hackathon-starter)
 *  
 *  @author Jeff Fox (jfox015)
 *  
 *  The MIT License (MIT)
 *  
 *  Copyright (c) 2015-18 Jeff Fox
 *  
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *  
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *  
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 *  
 */
/**
 * Main App dependencies.
 */
var express = require('express');
var flash = require('express-flash');
var session = require('express-session');
var expressValidator = require('express-validator');

var bodyParser = require('body-parser');
var compression = require('compression');
var connectAssets = require('connect-assets');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var logger = require('morgan');
var lusca = require('lusca');
var path = require('path');
var passport = require('passport');
var util = require("util");

// DB
var MongoStore = require('connect-mongo')(session);
//var JsonStore = require('express-session-json')(session);
var mongoose = require('mongoose');

/**
 * API keys
 */
var secrets = require('./config/secrets');
/**
 * Create Express server.
 */
var app = express();

/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;
mongoose.connect(secrets.db || secrets.db);
mongoose.connection.on('connected', () => {
  console.log('%s MongoDB connection established!', chalk.green('✓'));
});
mongoose.connection.on('error', () => {
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(expressValidator());
app.use(connectAssets({
  paths: [path.join(__dirname, 'public/css'), path.join(__dirname, 'public/js'), path.join(__dirname, 'public/app'), path.join(__dirname, 'public/fonts'), path.join(__dirname, 'public/template')]
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: secrets.sessionSecret,
  //store: new JsonStore({filename: 'session.json', path: 'config'} )
  store: new MongoStore({ url: secrets.db, autoReconnect: true })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(lusca({
    csrf: true,
    xframe: 'SAMEORIGIN',
    xssProtection: true
}));
app.use(flash());
app.use(logger('dev'));
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});
/*app.use(function(req, res, next) {
  res.locals._csrf = req.session._csrf || req.params._csrf || req.query._csrf;
  next();
});*/

app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
/**
 * Error Handler.
 */
app.use(errorHandler());

/**-----------------------------------
/ APP ROUTES
/-----------------------------------*/
require('./config/routes')(app);

/**
 * Start Express server.
 */
app.listen(app.get('port'), function() {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;