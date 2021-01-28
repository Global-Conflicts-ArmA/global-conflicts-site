const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/discordUser.model');

const router = express.Router();

router.get('/', function (req, res) {
	console.log('GET request for all users');
	User.find({}).exec(function (err, users) {
		if (err) {
			console.log('Error retrieving users');
		} else {
			res.json(users);
		}
	});
});

router.get('/:id', function (req, res) {
	console.log('GET request for single user');
	console.log('id check:', req.params.id);
	User.findOne({ id: req.params.id }).exec(function (err, user) {
		if (err) {
			console.log('Error retrieving user');
		} else {
			res.json(user);
		}
	});
});

router.post('/', function (req, res) {
	console.log('POST request for user');
	console.log('User', User);
	var newUser = new User();
	console.log('newUser', newUser);
	newUser.id = req.body.id;
	newUser.username = req.body.username;
	newUser.avatar = req.body.avatar ? req.body.avatar : null;
	newUser.avatarLink = req.body.avatarLink ? req.body.avatarLink : null;
	newUser.discriminator = req.body.discriminator;
	newUser.email = req.body.email;
	newUser.locale = req.body.locale;
	newUser.isAdmin = req.body.isAdmin ? true : false;
	console.log(newUser);
	newUser.save(function (err, insertedUser) {
		if (err) {
			console.log('Error saving user');
		} else {
			res.json(insertedUser);
		}
	});
});

module.exports = router;
