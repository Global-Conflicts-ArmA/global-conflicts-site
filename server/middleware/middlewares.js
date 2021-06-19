const httpError = require('http-errors');
const { getDiscordUserFromToken } = require('../misc/validate-cookies');
module.exports = {
	requireAdmin: async function (req, res, next) {
		const token = req.headers.token;
		const discordUser = await getDiscordUserFromToken(token);
		const role = discordUser.roles.cache.find(
			(r) => r.id === process.env.DISCORD_ADMIN_ROLE_ID
		);
		if (role) {
			return next();
		} else {
			return next(httpError(401, 'Not an admin'));
		}
	},

	requireMissionReviewer: async function (req, res, next) {
		const role = req.discordUser.roles.cache.find(
			(r) =>
				r.id === process.env.DISCORD_MISSION_REVIEW_TEAM_ROLE_ID ||
				r.id === process.env.DISCORD_ADMIN_ROLE_ID
		);
		if (role) {
			return next();
		} else {
			return next(httpError(401, 'Not a Mission Reviewer'));
		}
	},

	requireMissionMaker: async function (req, res, next) {
		console.log('_____________requireMissionMaker');
		const role = req.discordUser.roles.cache.find(
			(r) => r.id === process.env.DISCORD_MISSION_MAKER_ID
		);
		if (role) {
			return next();
		} else {
			return next(
				httpError(
					401,
					"You don't have the Mission Maker Tag on Discord."
				)
			);
		}
	},

	requireLogin: async function (req, res, next) {
		console.log('_____________requireLogin');
		const token = req.headers.token;
		if (!token) {
			return next(httpError(401));
		} else {
			try {
				req.discordUser = await getDiscordUserFromToken(token);
				return next();
			} catch (e) {
				return next(httpError(401, e));
			}
		}
	}
};
