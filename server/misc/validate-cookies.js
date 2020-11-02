const DiscordOauth2 = require("discord-oauth2");
const {discordJsClient, Discord} = require("../config/discord-bot");

async function getDiscordUserFromCookies(req, actionErrorMessage) {
	if (!req.cookies["token"]) {
		req.authError = 'Not signed in.';
		return callback(null, false);

	} else {
		const oauth = new DiscordOauth2({
			clientId: process.env.DISCORD_APP_ID,
			clientSecret: process.env.DISCORD_APP_SECRET_ID,
			redirectUri: process.env.DISCORD_CALLBACK_URL,
		});
		const discordUserResult = await oauth.getUser(req.cookies["token"]).catch(reason => {
			if (reason.code === 401) {
				req.authError = 'User not authorized.';
				return req;
			} else {
				req.authError = "Error on checking user's Discord info.";
				return req
			}
		});
		const guild = await discordJsClient.guilds.fetch(process.env.DISCORD_SERVER_ID);
		const member = await guild.members.fetch(discordUserResult.id);

		if (!member) {
			req.authError = 'User not registered on Global Conflicts Discord server.';
			return req

		}
		if (member.roles.highest.name === "@everyone") {
			req.authError = actionErrorMessage;
			return req
		}
		req.discordGuild = guild;
		req.discordUser = member;
		return req;
	}
}

module.exports.getDiscordUserFromCookies = getDiscordUserFromCookies;
