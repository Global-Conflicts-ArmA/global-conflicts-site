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
const multer = require("multer");
const Sentry = require("@sentry/node")
const Tracing = require("@sentry/tracing")




const app = express();

Sentry.init({
	dsn: "https://8666e9b7724048648c3488622b4fae41@o614507.ingest.sentry.io/5749699",
	integrations: [
		// enable HTTP calls tracing
		new Sentry.Integrations.Http({ tracing: true }),
		// enable Express.js middleware tracing
		new Tracing.Integrations.Express({ app }),
	],

	// Set tracesSampleRate to 1.0 to capture 100%
	// of transactions for performance monitoring.
	// We recommend adjusting this value in production
	tracesSampleRate: 1.0,
});

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());


// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());


if (config.env === 'development') {
	app.use(logger('dev'))
}

// Choose what fronten framework to serve the dist from
var distDir = '../../dist/';
if (config.frontend === 'react') {
	distDir = '../../node_modules/material-dashboard-react/dist'
} else {
	distDir = '../../dist/'
}

//
app.use(express.static(path.join(__dirname, distDir)));
app.use(/^((?!(api)).)*/, (req, res) => {
	res.sendFile(path.join(__dirname, distDir + '/index.html'))
});

console.log(distDir);
//React server
app.use(
	express.static(
		path.join(__dirname, '../../node_modules/material-dashboard-react/dist')
	)
);
app.use(/^((?!(api)).)*/, (req, res) => {
	res.sendFile(path.join(__dirname, '../../dist/index.html'))
});




app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());
app.use(compress());
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());

// API router
app.use('/api', routes);


// catch 404 and forward to error handler
app.use((req, res, next) => {
	const err = new httpError(404);
	return next(err)
});


// error handler, send stacktrace only during development
app.use((err, req, res, next) => {
	// customize Joi validation errors
	if (err.isJoi) {
		err.message = err.details.map((e) => e.message).join('; ');
		err.status = 400
	}

	res.status(err.status || 500).json({
		message: err.message,
	});
	next(err)
});

module.exports = app;
