const DiscordOauth2 = require('discord-oauth2');
const { GuildMember } = require('discord.js');
const { discordJsClient, Discord } = require('../config/discord-bot');
const httpError = require('http-errors');

async function getDiscordUserFromCookies(req, actionErrorMessage) {
	if (!req.cookies.token) {
		req.authError = 'Not signed in.';
		return req;
	} else {
		const oauth = new DiscordOauth2({
			clientId: process.env.DISCORD_APP_ID,
			clientSecret: process.env.DISCORD_APP_SECRET_ID,
			redirectUri: process.env.DISCORD_CALLBACK_URL
		});
		const discordUserResult = await oauth
			.getUser(req.cookies.token)
			.catch((reason) => {
				if (reason.code === 401) {
					req.authError = 'User not authorized.';
					return req;
				} else {
					req.authError = "Error on checking user's Discord info.";
					return req;
				}
			});
		const guild = await discordJsClient.guilds.fetch(
			process.env.DISCORD_SERVER_ID
		);
		const member = await guild.members.fetch(discordUserResult.id);

		if (!member) {
			req.authError =
				'User not registered on Global Conflicts Discord server.';
			return req;
		}
		if (member.roles.highest.name === '@everyone') {
			req.authError = actionErrorMessage;
			return req;
		}
		req.discordGuild = guild;
		req.discordUser = member;
		return req;
	}
}

async function getDiscordUserFromToken(token) {
	const oauth = new DiscordOauth2({
		clientId: process.env.DISCORD_APP_ID,
		clientSecret: process.env.DISCORD_APP_SECRET_ID,
		redirectUri: process.env.DISCORD_CALLBACK_URL
	});
	const discordUserResult = await oauth.getUser(token).catch((reason) => {
		if (reason.code === 401) {
			throw httpError(401, 'User not authorized.');
		} else {
			throw httpError(500, 'Error on checking users Discord info.');
		}
	});
	const guild = await discordJsClient.guilds.fetch(
		process.env.DISCORD_SERVER_ID
	);

	const member = await guild.members.fetch(discordUserResult.id);
	if (!member) {
		throw httpError(
			401,
			'User not registered on Global Conflicts Discord server.'
		);
	}
	member['roleslist'] = member.roles.cache.map(function (value) {
		return { id: value.id, name: value.name, color: value.hexColor };
	});
	member["avatar"] = member.user.avatar;

	member["isAdmin"] = function(){
		const me = this;
		return me.roles.cache.find(
			(r) => r.id === process.env.DISCORD_ADMIN_ROLE_ID
		);
	}
	return member;
}

module.exports.getDiscordUserFromCookies = getDiscordUserFromCookies;
module.exports.getDiscordUserFromToken = getDiscordUserFromToken;
