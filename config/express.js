var globule = require('globule'),
		config = require('./config'),
		express = require('express');

var path = require('path');
var logger = require('morgan');

var cookieParser = require('cookie-parser'),
		favicon = require('serve-favicon'),
		session = require('express-session'),
		bodyParser = require('body-parser'),
		flash = require('connect-flash'),
		helmet = require('helmet');

module.exports = function(db) {
	var app = express();

	// find models
	globule.find('./app/models/**/*.js').forEach(function(model) {
		require(path.resolve(model));
	});

	// Application local variables (Title, Description?, Keywords?)
	app.locals.title = config.app.title;

	// Pass the request url to the environment locals
	app.use(function(req, res, next) {
		res.locals.url = req.protocol + "://" + req.headers.host + req.url;
		next();
	});

	// Compression (should be placed before express.static)

	// Show stack errors
	app.set('showStackError');

	// uncomment after placing your favicon in /public
	//app.use(favicon(__dirname + '/public/favicon.ico'));
	app.use(logger('dev'));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	
	// view engine setup
	app.set('views', path.join('app', 'views'));
	app.set('view engine', 'jade');

	// Environment configuration
	if (process.env.NODE_ENV === 'development') {
		// Disable views cache
		app.set('view cache', false);
	} else if (process.env.NODE_ENV === 'production') {
		app.locals.cache = 'memory';
	}

	app.use(helmet());

	app.disable('x-powered-by');

	app.use(express.static(path.join(process.cwd(), 'public')));

	app.use(cookieParser());
	app.use(flash());

	// find routes
	globule.find('./app/routes/**/*.js').forEach(function(route) {
		require(path.resolve(route))(app);
	});

	return app;
};