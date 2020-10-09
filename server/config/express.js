const path = require('path');
const express = require('express');
const httpError = require('http-errors');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('../routes/index.route');
const config = require('./config');

const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('../strategies/discordstrategy');

const app = express();

if (config.env === 'development') {
	app.use(logger('dev'));
}

// Choose what fronten framework to serve the dist from
var distDir = '../../dist/';
if (config.frontend == 'react') {
	distDir = '../../node_modules/material-dashboard-react/dist'
} else {
	distDir = '../../dist/';
}

//
app.use(express.static(path.join(__dirname, distDir)))
app.use(/^((?!(api)).)*/, (req, res) => {
	res.sendFile(path.join(__dirname, distDir + '/index.html'));
});

console.log(distDir);
//React server
app.use(express.static(path.join(__dirname, '../../node_modules/material-dashboard-react/dist')))
app.use(/^((?!(api)).)*/, (req, res) => {
	res.sendFile(path.join(__dirname, '../../dist/index.html'));
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());
app.use(compress());
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

passport.serializeUser(function (user, done) {
	done(null, user);
});
passport.deserializeUser(function (obj, done) {
	done(null, obj);
});


app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize({}));
app.use(passport.session({}));

// API router
app.use('/api', routes);


// catch 404 and forward to error handler
app.use((req, res, next) => {
	const err = new httpError(404)
	return next(err);
});

// error handler, send stacktrace only during development
app.use((err, req, res, next) => {

	// customize Joi validation errors
	if (err.isJoi) {
		err.message = err.details.map(e => e.message).join("; ");
		err.status = 400;
	}

	res.status(err.status || 500).json({
		message: err.message
	});
	next(err);
});

module.exports = app;
