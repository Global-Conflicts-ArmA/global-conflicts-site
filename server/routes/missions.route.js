const express = require('express');
const Mission = require('../models/mission.model');
const User = require('../models/discordUser.model');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const DiscordOauth2 = require('discord-oauth2');
const { getDiscordUserFromCookies } = require('../misc/validate-cookies');
const { discordJsClient, Discord } = require('../config/discord-bot');
const trustedUploaderRoles = ['Admin', 'GM', 'Mission Maker'];

fileFilterFunction = async function (req, file, callback) {
	req = await getDiscordUserFromCookies(
		req,
		'User is not allowed to upload missions.'
	);

	if (req.authError) {
		return callback(null, false);
	}

	req.uploadPath = process.env.TEST_SERVER_READY;
	req.missionDataErrors = validateUploadData(req.body);
	if (Object.keys(req.missionDataErrors).length > 0) {
		callback(null, false);
		return;
	}
	if (file.mimetype !== 'application/octet-stream') {
		req.missionDataErrors.file = 'File is not a .pbo.';
		callback(null, false);
		return;
	} else {
		const originalNameArray = file.originalname.split('.');
		const format = originalNameArray[originalNameArray.length - 1];
		if (format !== 'pbo') {
			req.missionDataErrors.file = 'File is not a pbo.';
			callback(null, false);
			return;
		} else if (
			fs.existsSync(
				`${process.env.ROOT_FOLDER}${req.uploadPath}/${file.originalname}`
			)
		) {
			req.missionDataErrors.misc =
				'A mission with this filename already exists.';
			callback(null, false);
			return;
		}
	}
	req.file = file;
	callback(null, true);
};

const uploadMulter = multer({
	limits: { fieldSize: 25 * 1024 * 1024 },
	fileFilter: fileFilterFunction,
	storage: multer.diskStorage({
		destination: function (req, file, cb) {
			cb(
				null,
				`${process.env.ROOT_FOLDER}/${process.env.TEST_SERVER_READY}`
			);
		},
		filename: function (req, file, cb) {
			cb(null, req.body.fileName);
		}
	})
});

function validateUploadData(reqBody, res) {
	const errors = {};
	if (!reqBody.authorID) {
		errors.authorID = 'Missing authorID.';
	}
	if (!reqBody.name) {
		errors.name = 'Missing name.';
	}
	if (!reqBody.terrain) {
		errors.terrain = 'Missing terrain.';
	}
	const validMissionTypes = ['COOP', 'TVT', 'COTVT', 'LOL', 'TRAINING'];
	if (!reqBody.type) {
		errors.type = 'Missing mission type.';
	} else if (!validMissionTypes.includes(reqBody.type)) {
		errors.type = 'Invalid mission type.';
	}
	if (!reqBody.size) {
		errors.size = 'Missing size.';
	}
	if (!reqBody.description) {
		errors.description = 'Missing description.';
	}
	if (!reqBody.tags) {
		errors.tags = 'Missing tags.';
	}
	if (!reqBody.timeOfDay) {
		errors.timeOfDay = 'Missing timeOfDay.';
	}
	if (!reqBody.era) {
		errors.era = 'Missing era.';
	}
	if (!reqBody.version) {
		errors.version = 'Missing Version.';
	}
	if (!reqBody.updates) {
		errors.updates = 'Missing Updates Array.';
	}
	if (!reqBody.fileName) {
		errors.fileName = 'Missing Filename.';
	}
	return errors;
}

function insertMissionOnDatabase(mission, query) {
	const options = {
		upsert: true,
		safe: true,
		new: true
	};
	Mission.findOneAndUpdate(query, mission, options, (err, doc) => {
		if (err) {
			console.log(err);
		}
	});
}

async function insertUserOnDatabase(user, query, missionID) {
	const options = {
		upsert: true,
		safe: true,
		new: true
	};
	User.findOneAndUpdate(query, user, options, (err, userData) => {
		if (err) {
			console.log(err);
		} else {
			if (!userData.missions) {
				userData.missions = [missionID];
				userData.save((error2) => {
					if (error2) {
						console.log(err);
					}
				});
			} else {
				if (userData.missions.indexOf(missionID) === -1) {
					userData.missions.push(missionID);
					userData.save((error2) => {
						if (error2) {
							console.log(err);
						}
					});
				}
			}
		}
	});
}

async function getImage(base64Image) {
	let parts = base64Image.split(';');
	let mimType = parts[0].split(':')[1];
	let imageData = parts[1].split(',')[1];
	var img = await Buffer.from(imageData, 'base64');
	const resizedBuffer = await sharp(img)
		.resize(256, 256)
		.toBuffer()
		.catch((e) => {
			console.log('imageError', e);
		});
	return resizedBuffer;
}

async function postDiscord(reqBody, avatarURL) {
	const newMissionEmbed = new Discord.MessageEmbed()
		.setColor('#22cf26')
		.setTitle(reqBody.fileName)
		.setAuthor(`Author: ${reqBody.author}`, avatarURL)
		.addFields(
			{ name: 'Description:', value: reqBody.description, inline: false },
			{
				name: 'Player Count:',
				value: `**Min:** ${reqBody.size.min} **Max:** ${reqBody.size.max}`,
				inline: true
			},
			{ name: 'Type:', value: reqBody.type, inline: true },
			{ name: 'Terrain:', value: reqBody.terrain, inline: true },
			{ name: 'Time of Day:', value: reqBody.timeOfDay, inline: true },
			{ name: 'Era:', value: reqBody.era, inline: true },
			{
				name: 'Tags:',
				value: reqBody.tags.join(', '),
				inline: false
			}
		)
		.setTimestamp()
		.setURL('')
		.setFooter('\u3000'.repeat(10 /*any big number works too*/) + '|');

	if (
		reqBody.ratios &&
		(reqBody.ratios[0] > -1 ||
			reqBody.ratios[1] > -1 ||
			reqBody.ratios[2] > -1 ||
			reqBody.ratios[3] > -1)
	) {
		let ratioStr = '';
		if (reqBody.ratios[0] > -1) {
			ratioStr = ratioStr + `**Blufor:** ${reqBody.ratios[0]} `;
		}
		if (reqBody.ratios[1] > -1) {
			ratioStr = ratioStr + `**Opfor:** ${reqBody.ratios[1]} `;
		}
		if (reqBody.ratios[2] > -1) {
			ratioStr = ratioStr + `**Indfor:** ${reqBody.ratios[2]} `;
		}
		if (reqBody.ratios[3] > -1) {
			ratioStr = ratioStr + `**Civ:** ${reqBody.ratios[3]} `;
		}
		newMissionEmbed.addField('Ratios:', ratioStr, false);
	}

	if (reqBody.image) {
		const resizedBuffer = await getImage(reqBody.image);
		let attachment = new Discord.MessageAttachment(
			resizedBuffer,
			'img.png'
		);
		newMissionEmbed.attachFiles([attachment]);
		newMissionEmbed.setImage('attachment://img.png');
	}

	discordJsClient.channels.cache
		.get(process.env.DISCORD_BOT_CHANNEL)
		.send('New mission uploaded', newMissionEmbed);
}

// upload mission
router.post('/', uploadMulter.single('fileData'), (req, res) => {
	if (req.authError) {
		return res.status(401).send({
			authError: req.authError
		});
	}

	if (Object.keys(req.missionDataErrors).length > 0) {
		return res.status(400).send({ missionErrors: req.missionDataErrors });
	}

	postDiscord(req.body, req.discordUser.user.displayAvatarURL());

	const firstUpdate = {
		version: req.body.updates[0].version,
		authorID: req.body.updates[0].authorID,
		date: req.body.updates[0].date,
		fileName: req.body.updates[0].fileName,
		path: `${process.env.ROOT_FOLDER}${process.env.TEST_SERVER_READY}`
	};

	const mission = {
		uniqueName: req.body.uniqueName,
		name: req.body.name,
		authorID: req.body.authorID,
		terrain: req.body.terrain,
		type: req.body.type,
		size: req.body.size,
		ratios: req.body.ratios,
		description: req.body.description,
		tags: req.body.tags,
		timeOfDay: req.body.timeOfDay,
		era: req.body.era,
		uploadDate: Date.now(),
		lastUpdate: Date.now(),
		updates: [firstUpdate],
		version: req.body.version,
		reports: req.body.reports,
		reviews: req.body.reviews
	};
	console.log('size type:', typeof mission.size);
	if (req.body.image) {
		mission.image = req.body.image;
	}
	const query = { uniqueName: req.body.uniqueName };
	insertMissionOnDatabase(mission, query);

	const user = {
		discordId: req.discordUser.user.id,
		username: req.discordUser.user.username,
		avatar: req.discordUser.user.displayAvatarURL()
	};
	const userQuery = { discordId: req.discordUser.user.id };
	insertUserOnDatabase(user, userQuery, req.body.uniqueName);

	return res.send({ ok: true });
});

// lists all missions
router.get('/', async (req, res) => {
	req = await getDiscordUserFromCookies(
		req,
		'User not allowed to list missions.'
	);

	if (req.authError) {
		return res.status(401).send({
			authError: req.authError
		});
	}
	console.log('GET request for all missions');
	Mission.find({}, { _id: 0 }).exec((err, missions) => {
		if (err) {
			res.status(500).send(err);
		} else {
			res.json(missions);
		}
	});
});

//get mission by uniqueName
router.get('/:uniqueName', async (req, res) => {
	req = await getDiscordUserFromCookies(
		req,
		'User not allowed to list missions.'
	);
	if (req.authError) {
		return res.status(401).send({
			authError: req.authError
		});
	}
	Mission.findOne({ uniqueName: req.params.uniqueName }, (err, mission) => {
		if (err) {
			res.status(500).send(err);
		} else {
			res.json(mission);
		}
	});
});
module.exports = router;
