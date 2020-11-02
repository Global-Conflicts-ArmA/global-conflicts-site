const express = require('express');
const Mission = require('../models/mission.model');
const router = express.Router();
const multer = require('multer')
const fs = require('fs')
const path = require('path');
const DiscordOauth2 = require("discord-oauth2");
const {getDiscordUserFromCookies} = require("../misc/validate-cookies");
const {discordJsClient, Discord} = require("../config/discord-bot");

const trustedUploaderRoles = ['Admin', 'GM', 'Mission Maker'];

fileFilterFunction = async function (req, file, callback) {

	req = await getDiscordUserFromCookies(req, 'User is not allowed to upload missions.');

	if (req.authError) {
		return callback(null, false);
	}


	const isTrustedUploader = req.discordUser.roles.cache.find(r => trustedUploaderRoles.indexOf(r.name) !== -1)
	req.uploadPath = isTrustedUploader ? process.env.TEST_SERVER_MPMissions : process.env.TEST_SERVER_READY;
	req.missionDataErrors = validateUploadData(req);
	if (Object.keys(req.missionDataErrors).length > 0) {
		callback(null, false);
		return;
	}
	if (file.mimetype !== 'application/octet-stream') {
		req.missionDataErrors["missionFile"] = 'File is not a .pbo.';
		callback(null, false);
		return;
	} else {
		const originalNameArray = file.originalname.split('.');
		const format = originalNameArray[originalNameArray.length - 1]
		if (format !== "pbo") {
			req.missionDataErrors["missionFile"] = 'File is not a pbo.';
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
	fileFilter: fileFilterFunction,
	storage: multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, `${process.env.ROOT_FOLDER}${req.uploadPath}`)
		},
		filename: function (req, file, cb) {
			cb(null, file.originalname)
		}
	})
})


function validateUploadData(req, res) {
	const errors = {};
	if (req.fileValidationError) {
		errors.mission = req.fileValidationError
	}
	if (!req.body.description) {
		errors.description = "Missing description.";
	}
	if (!req.body.minPlayers) {
		errors.minPlayers = "Missing minimum amount of players.";
	}
	if (!req.body.maxPlayers) {
		errors.maxPlayers = "Missing maximum amount of players.";
	}
	if (!req.body.missionName) {
		errors.missionName = "Missing mission Name.";
	}
	if (!req.body.version) {
		errors.version = "Missing Version.";
	}

	const validMissionType = ["COOP", "TVT", "COTVT", "LOL"]
	if (!req.body.missionType) {
		errors.missionType = "Missing mission type.";
	} else if (validMissionType.indexOf(req.body.missionType) === -1) {
		errors.missionType = "Invalid mission type.";
	}

	return errors;


}

function insertMissionOnDatabase(mission) {
	mission.save(function (err) {
		if (err) {
			console.log(err);
		}
	})
}


router.get("/scan", function (req, res) {
	let pass = req.query.pass;
	if (pass !== process.env.ADMIN_PASSWORD) {
		return res.send(401);

	}

	const paths = [process.env.TEST_SERVER_READY, process.env.TEST_SERVER_MPMissions, process.env.MAIN_SERVER_MPMissions];

	paths.forEach(path => {

		fs.readdir(`${process.env.ROOT_FOLDER}${path}`, function (err, files) {
			if (err) {
				return console.log('Unable to scan directory: ' + err);
			}
			try {
				let iA = 0;
				for (let i = 0; i < files.length; i++) {
					iA = i;
					let file = files[i];

					const fileDotSplit = file.split('.')
					const format = fileDotSplit[fileDotSplit.length - 1]
					if (format !== "pbo") {
						continue;
					}
					const terrain = fileDotSplit[fileDotSplit.length - 2]
					let missionName = ""
					let version = ""
					let missionType = ""
					let maxPlayers = ""
					let fileStats = ""
					try {
						missionName = file.match(new RegExp('(?<=_)(.*)(?=_[Vv])'))[0];
						version = file.match(new RegExp('([^vV]+)(\\.)'))[0].split('.')[0]
						missionType = file.match('^[a-zA-Z]{2,}')[0].toUpperCase();
						maxPlayers = file.match('(\\d+)')[0].toUpperCase();
						fileStats = fs.statSync(`${path}/${file}`);
					} catch (e) {
						console.log(e);
						continue;
					}

					console.log(file);
					console.log(`${missionType} | ${maxPlayers} | ${missionName} | ${terrain}`);
					console.log('_________________________________________________________');

					Mission.updateOne({fileName: file}, {
						$setOnInsert: {
							name: missionName,
							fileName: file,
							author: "--",
							authorID: "--",
							type: missionType,
							terrain: terrain,
							description: "--",
							maxPlayers: maxPlayers,
							minPlayers: 0,
							uploadDate: fileStats.mtime,
							version: version,
						},
						$addToSet: {paths: path}
					}, {upsert: true}, (err, docs) => {
						if (err) {
							console.log(`Error upserting ${err}`)
						} else {
							console.log(`Upserted`)
						}
					});


				}
			} catch (e) {
				console.log(e);
			}
		})
	});
	return res.send("ok");
});

router.post("/", uploadMulter.single("missionFile"), (req, res) => {


	if (req.authError) {
		return res.status(401).send({
			"authError": req.authError
		})
	}


	if (Object.keys(req.missionDataErrors).length > 0) {
		return res.status(400).send({"missionErrors": req.missionDataErrors})
	}

	let fullMissionName = req.file.originalname;

	const newMissionEmbed = new Discord.MessageEmbed()
		.setColor('#22cf26')
		.setTitle(fullMissionName)
		.setAuthor(`Author: ${req.discordUser.user.username}`, req.discordUser.user.displayAvatarURL())
		.setDescription(`Directory: ${req.uploadPath}`)
		.addField('Description', req.body.description)
		.addField('Min. Players', req.body.minPlayers)
		.setFooter("👍 if tested and ready")
		.setTimestamp()


	discordJsClient.channels.cache
		.get(process.env.DISCORD_BOT_CHANNEL)
		.send('New mission uploaded to the Test Server!', newMissionEmbed)
		.then(embedMessage => {
			embedMessage.react("👍");
		})
	// TODO save mission on mongodb

	const terrain = (req.file.originalname.substring(
		req.file.originalname.indexOf('.') + 1,
		req.file.originalname.lastIndexOf('.')
	));

	const mission = new Mission({
		name: req.body.missionName,
		fileName: req.file.originalname,
		author: req.discordUser.user.username,
		authorID: req.discordUser.user.id,
		type: req.body.missionType,
		terrain: terrain,
		description: req.body.description,
		maxPlayers: req.body.maxPlayers,
		minPlayers: req.body.minPlayers,
		uploadDate: Date.now(),
		version: req.body.version,
		paths: [req.uploadPath],

	});
	insertMissionOnDatabase(mission)


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
