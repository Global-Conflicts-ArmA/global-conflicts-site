const express = require('express');
const router = express.Router();
const DiscordOauth2 = new require("discord-oauth2");
const {discordJsClient} = require("../config/discord-bot");


const discordOauth2 = new DiscordOauth2({
	clientId: process.env.DISCORD_APP_ID,
	clientSecret: process.env.DISCORD_APP_SECRET_ID,
	redirectUri: process.env.DISCORD_CALLBACK_URL,
});


router.get("/login", function (req, res) {
	console.log('login');
});

router.get("/logout", function (req, res) {
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]

	const credentials = Buffer.from(`${process.env.DISCORD_APP_ID}:${process.env.DISCORD_APP_SECRET_ID}`).toString("base64");

	discordOauth2.revokeToken(token, credentials).then(r => {
		res.send({"ok": true})
	}).catch(reason => {
		console.log(reason);
	})
});


async function getUser(token) {

	const user = await discordOauth2.getUser(token)
	const guild = await discordJsClient.guilds.cache.get(process.env.DISCORD_SERVER_ID);
	return guild.members.fetch(user.id)
		.then(member => {
			if (member.roles.highest.name !== "@everyone") {
				return {
					token: token,
					username: member.user.username,
					role: member.roles.highest.name,
					roleColor: member.roles.highest.hexColor,
					id: member.user.id,
					avatar: member.user.avatar,
				}
			} else {
				return {
					token: token,
					username: member.user.username
				}
			}
		})

		.catch(reason => {
			return {token: token}
		})


}


router.get("/callback", function (req, res) {
	discordOauth2.tokenRequest({
		code: req.query.code,
		scope: ["identify", "guilds"],
		grantType: "authorization_code"
	}).then(async function (tokenRequestResult) {
			const user = await getUser(tokenRequestResult.access_token)
			res.cookie('token', user.token);
			if (user.username) res.cookie('username', user.username);
			if (user.role) res.cookie('role', user.role);
			if (user.roleColor) res.cookie('roleColor', user.roleColor);
			if (user.id) res.cookie('id', user.id);
			if (user.avatar) res.cookie('avatar', user.avatar);
			return res.redirect('/');
		}
	).catch(reason => {
		return res.redirect('/');
	})
});

module.exports = router;
