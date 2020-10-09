const express = require('express');
const passport = require('passport');

const router = express.Router();

router.get("/login",
	passport.authenticate('discord', {scope: ['identify', 'guilds',], prompt: 'consent'}),
	function (req, res) {
	}
);

router.get('/callback',
	passport.authenticate('discord', {failureRedirect: '/'}), function (req, res) {
		res.redirect('/api/auth/info')
	} // auth success
);

router.get('/info', checkAuth, function (req, res) {
	//console.log(req.user)
	res.json(req.user);
});

function checkAuth(req, res, next) {
	if (req.isAuthenticated()) return next();
	res.send('not logged in :(');
}

module.exports = router;
