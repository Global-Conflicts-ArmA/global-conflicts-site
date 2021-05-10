const express = require('express');
const usersRoutes = require('./users.route');
const authRoute = require('./auth.route');
const missionsRoutes = require('./missions.route');
const mongoose = require('mongoose');
const session = require('express-session');

const router = express.Router(); // eslint-disable-line new-cap

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
	console.log('ERROR: ' + reason);
	res.status(code || 500).json({ error: message });
}

/** GET /health-check - Check service health */
router.get('/health-check', function (req, res) {
	res.send('OK');
});

router.use('/auth', authRoute);
router.use('/users', usersRoutes);
router.use('/missions', missionsRoutes);

module.exports = router;
