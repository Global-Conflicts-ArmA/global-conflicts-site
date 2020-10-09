const Strategy = require('passport-discord').Strategy;
const passport = require('passport');
const User = require("mongoose/lib/model");

var scopes = ['identify', 'email', /* 'connections', (it is currently broken) */ 'guilds', 'guilds.join'];
var prompt = 'consent';

passport.use(new Strategy({
	clientID: '764221298158600202',
	clientSecret: 'a0F4dZst_kmNMpIe0vtIj4Obi90ydxKn',
	callbackURL: 'http://localhost:4200/api/auth/callback',
	scope: scopes,
	prompt: prompt
}, function (accessToken, refreshToken, profile, done) {
	process.nextTick(function () {
		return done(null, profile);
	});
}));
