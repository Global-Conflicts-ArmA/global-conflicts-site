const express = require('express');
const Mission = require('../models/mission.model');
const User = require('../models/discordUser.model');
const router = express.Router();
const multer = require('multer')
const fs = require('fs')
const path = require('path');
const sharp = require('sharp');
const DiscordOauth2 = require("discord-oauth2");
const {getDiscordUserFromCookies} = require("../misc/validate-cookies");
const {discordJsClient, Discord} = require("../config/discord-bot");
const {MissionTerrains} = require('../mission-enums');

const trustedUploaderRoles = ['Admin', 'GM', 'Mission Maker'];

fileFilterFunction = async function (req, file, callback) {

	req = await getDiscordUserFromCookies(req, 'User is not allowed to upload missions.');

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
		req.missionDataErrors["file"] = 'File is not a .pbo.';
		callback(null, false);
		return;
	} else {
		const originalNameArray = file.originalname.split('.');
		const format = originalNameArray[originalNameArray.length - 1]
		if (format !== "pbo") {
			req.missionDataErrors["file"] = 'File is not a pbo.';
			callback(null, false);
			return;
		} else if (fs.existsSync(`${process.env.ROOT_FOLDER}${req.uploadPath}/${file.originalname}`)) {
			req.missionDataErrors["misc"] = 'A mission with this filename already exists.';
			callback(null, false);
			return;
		}
		//TODO validate mission name

	}
	req.file = file;
	callback(null, true);
}


const uploadMulter = multer({
	limits: { fieldSize: 25 * 1024 * 1024 },
	fileFilter: fileFilterFunction,
	storage: multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, `${process.env.ROOT_FOLDER}${req.uploadPath}`)
		},
		filename: function (req, file, cb) {
			cb(null, req.body.fileName)
		}
	})
})


function validateUploadData(reqBody, res) {
	const errors = {};
	if (!reqBody.author) {
		errors.author = "Missing author.";
	}
	if (!reqBody.authorID) {
		errors.authorID = "Missing authorID.";
	}
	if (!reqBody.name) {
		errors.name = "Missing name.";
	}
	if (!reqBody.fileName) {
		errors.fileName = "Missing fileName.";
	}
	if (!reqBody.terrain) {
		errors.terrain = "Missing terrain.";
	}
	const validMissionTypes = ["COOP", "TVT", "COTVT", "LOL", "TRAINING"];
	if (!reqBody.type) {
		errors.type = "Missing mission type.";
	} else if (!validMissionTypes.includes(reqBody.type)) {
		errors.type = "Invalid mission type.";
	}
	if (!reqBody.size) {
		errors.size = "Missing size.";
	}
	if (!reqBody.description) {
		errors.description = "Missing description.";
	}
	if (!reqBody.tags) {
		errors.tags = "Missing tags.";
	}
	if (!reqBody.timeOfDay) {
		errors.timeOfDay = "Missing timeOfDay.";
	}
	if (!reqBody.era) {
		errors.era = "Missing era.";
	}
	if (!reqBody.version) {
		errors.version = "Missing Version.";
	}
	return errors;
}

async function insertMissionOnDatabase(mission, query) {
	const options = {
		upsert: true,
		safe: true,
		new: true,
	};
	let missionData = await Mission.findOneAndUpdate(query, mission, options, function(err, doc) {
		if (err) {
			console.log(err);
		}
	});
}

async function insertUserOnDatabase(user, query, missionID) {
	const options = {
		upsert: true,
		safe: true,
		new: true,
	};
	let userData = await User.findOneAndUpdate(query, user, options, function(err, doc) {
		if (err) {
			console.log(err);
		}
	});
	if (userData.missions.indexOf(missionID) === -1) {
		userData.missions.push(missionID);
		userData.save(function (err) {
			if (err) {
				console.log(err);
			}
		})
	}
}

async function getImage(base64Image) {
	let parts = base64Image.split(';');
	let mimType = parts[0].split(':')[1];
	let imageData = parts[1].split(',')[1];
	var img = await Buffer.from(imageData, 'base64');
	const resizedBuffer = await sharp(img)
		.resize(256, 256)
		.toBuffer()
		.catch(e => {console.log('imageError', e)})
	return resizedBuffer
}

async function postDiscord(reqBody, avatarURL, uploadPath) {
	let strTerrain = '';
	if (MissionTerrains[reqBody.terrain]) {
		strTerrain = MissionTerrains[reqBody.terrain].name;
	}

	const newMissionEmbed = new Discord.MessageEmbed()
		.setColor('#22cf26')
		.setTitle(reqBody.fileName)
		.setAuthor(`Author: ${reqBody.author}`, avatarURL)
		.setDescription(`Directory: ${uploadPath}`)
		.addFields(
			{ name: 'Description:', value: reqBody.description, inline: false },
			{ name: 'Player Count:', value: `**Min:** ${reqBody.size.split(",")[0]} **Max:** ${reqBody.size.split(",")[1]}`, inline: true },
			{ name: 'Type:', value: reqBody.type, inline: true },
			{ name: 'Terrain:', value: strTerrain, inline: true },
			{ name: 'Time of Day:', value: reqBody.timeOfDay, inline: true },
			{ name: 'Era:', value: reqBody.era, inline: true },
			{ name: 'Tags:', value: reqBody.tags.split(",").join(", "), inline: false },
		)
		.setFooter("")
		.setTimestamp()

		if (reqBody.ratios) {
			let ratioStr = '';
			let splitStr = reqBody.ratios.split(",");
			if (splitStr[0] > 0) {
				ratioStr = ratioStr + `**Blufor:** ${splitStr[0]} `
			}
			if (splitStr[1] > 0) {
				ratioStr = ratioStr + `**Opfor:** ${splitStr[1]} `
			}
			if (splitStr[2] > 0) {
				ratioStr = ratioStr + `**Indfor:** ${splitStr[2]} `
			}
			if (splitStr[3] > 0) {
				ratioStr = ratioStr + `**Civ:** ${splitStr[3]} `
			}
			newMissionEmbed.addField('Ratios:',ratioStr,false);
		}

		if (reqBody.image) {
			const resizedBuffer = await getImage(reqBody.image);
			let attachment = new Discord.MessageAttachment(resizedBuffer, "img.png");
			newMissionEmbed.attachFiles([attachment])
			newMissionEmbed.setImage('attachment://img.png');
		}

		discordJsClient.channels.cache
			.get(process.env.DISCORD_BOT_CHANNEL)
			.send('New mission uploaded', newMissionEmbed)
}

router.post("/", uploadMulter.single('fileData'), (req, res) => {

	if (req.authError) {
		return res.status(401).send({
			"authError": req.authError
		})
	}

	if (Object.keys(req.missionDataErrors).length > 0) {
		return res.status(400).send({"missionErrors": req.missionDataErrors})
	}

	postDiscord(req.body, req.discordUser.user.displayAvatarURL(), req.uploadPath);

	const mission = {
		name: req.body.name,
		fileName: req.body.fileName,
		author: req.body.author,
		authorID: req.body.authorID,
		terrain: req.body.terrain,
		type: req.body.type,
		size: req.body.size,
		description: req.body.description,
		tags: req.body.tags,
		timeOfDay: req.body.timeOfDay,
		era: req.body.era,
		uploadDate: Date.now(),
		version: req.body.version,
		paths: [req.uploadPath],
	};
	if (req.body.image) {mission.image = req.body.image};
	const query = { fileName: req.body.fileName };
	insertMissionOnDatabase(mission, query);

	const user = {
		discordId: req.discordUser.user.id,
		username: req.discordUser.user.username,
		avatar: req.discordUser.user.displayAvatarURL(),
		role: req.discordUser.roles.highest.name,
	};
	const userQuery = { discordId: req.discordUser.user.id };
	insertUserOnDatabase(user, userQuery, req.body.fileName);

	return res.send({"ok": true})
});

router.get("/", async (req, res) => {
	req = await getDiscordUserFromCookies(req, 'User not allowed to list missions.');

	if (req.authError) {
		return res.status(401).send({
			"authError": req.authError
		})
	}
	console.log('GET request for all missions');
	const missions = await Mission.find({}, {"_id": 0}).exec();
	return res.json(missions);
});

module.exports = router;
