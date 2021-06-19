const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/discordUser.model');
const { requireAdmin } = require('../middleware/middlewares');
const { getDiscordUserFromCookies } = require('../misc/validate-cookies');
const router = express.Router();
const { discordJsClient } = require('../config/discord-bot');
const { Observable } = require('rxjs');

var userCache = [];

async function getRemoteUser(id) {
	const guild = discordJsClient.guilds.cache.get(
		process.env.DISCORD_SERVER_ID
	);
	return guild.members
		.fetch(id)
		.then((member) => {
			return member;
		})
		.catch((reason) => {
			return reason;
		});
}

router.get('/discord_users', [requireAdmin], async (req, res) => {
	// Get the Guild and store it under the variable "list"
	discordJsClient.guilds
		.fetch(process.env.DISCORD_SERVER_ID)
		.then((guild) => {
			guild.members
				.fetch()
				.then((value) => {
					return res.json(value);
				})
				.catch((reason) => {
					return res.json([]);
				});
		});
});

router.get('/', (req, res) => {
	console.log('GET request for all users');
	User.find({}).exec((err, users) => {
		if (err) {
			console.log('Error retrieving users');
		} else {
			res.json(users);
		}
	});
});

router.get('/fetch/:id', async (req, res) => {
	console.log('req.params.id: ', req.params.id);
	const userFind = userCache.find((user) => user.id === req.params.id);
	if (userFind) {
		console.log('fetch userData from server:', userFind.displayName);
		res.json(userFind);
	} else {
		console.log('fetch userData from discord');
		getRemoteUser(req.params.id)
			.then((result) => {
				userCache.push(result);
				res.json(result);
			})
			.catch((err) => {
				console.log('Error retrieving user');
			});
	}
});

router.get('/:id/', (req, res) => {
	console.log('GET request for single user');
	User.findOne({ discordId: req.params.id }).exec((err, user) => {
		if (err) {
			console.log('Error retrieving user');
		} else {
			res.json(user);
		}
	});
});

router.post('/', (req, res) => {
	console.log('POST request for user');
	var newUser = new User();
	newUser.id = req.body.id;
	newUser.username = req.body.username;
	newUser.avatar = req.body.avatar ? req.body.avatar : null;
	newUser.avatarLink = req.body.avatarLink ? req.body.avatarLink : null;
	newUser.discriminator = req.body.discriminator;
	newUser.email = req.body.email;
	newUser.locale = req.body.locale;
	newUser.isAdmin = req.body.isAdmin ? true : false;
	console.log(newUser);
	newUser.save((err, insertedUser) => {
		if (err) {
			console.log('Error saving user');
		} else {
			res.json(insertedUser);
		}
	});
});

module.exports = router;
