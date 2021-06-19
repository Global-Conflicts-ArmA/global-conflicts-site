const express = require('express');
const router = express.Router();
const DiscordOauth2 =  require('discord-oauth2');
const {requireLogin, requireMissionReviewer} = require('../middleware/middlewares');


const { discordJsClient } = require('../config/discord-bot');

const discordOauth2 = new DiscordOauth2({
	clientId: process.env.DISCORD_APP_ID,
	clientSecret: process.env.DISCORD_APP_SECRET_ID,
	redirectUri: process.env.DISCORD_CALLBACK_URL
});

router.get('/login', [requireLogin], function (req, res) {
	return res.send(req.discordUser);
});

router.get('/logout', function (req, res) {
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.split(' ')[1];

	const credentials = Buffer.from(
		`${process.env.DISCORD_APP_ID}:${process.env.DISCORD_APP_SECRET_ID}`
	).toString('base64');

	discordOauth2
		.revokeToken(token, credentials)
		.then((r) => {
			res.send({ ok: true });
		})
		.catch((reason) => {
			// tslint:disable-next-line:no-console
			console.log(reason);
		});
});

async function getUser(token) {
	const user = await discordOauth2.getUser(token);
	const guild = discordJsClient.guilds.cache.get(
		process.env.DISCORD_SERVER_ID
	);
	return guild.members
		.fetch(user.id)
		.then((member) => {
			if (member.roles.highest.name !== '@everyone') {
				return {
					token: token,
					username: member.user.username,
					roles: member.roles,
					roleColor: member.roles.highest.hexColor,
					id: member.user.id,
					avatar: member.user.avatar
				};
			} else {
				return {
					token: token,
					username: member.user.username
				};
			}
		})
		.catch((reason) => {
			return { token: token };
		});
}

router.get('/callback', function (req, res) {
	discordOauth2
		.tokenRequest({
			code: req.query.code,
			scope: ['identify', 'guilds'],
			grantType: 'authorization_code'
		})
		.then(async function (tokenRequestResult) {
			const user = await getUser(tokenRequestResult.access_token);
			return res.redirect('/?token=' + tokenRequestResult.access_token);
		})
		.catch((reason) => {
			return res.redirect('/');
		});
});

module.exports = router;
