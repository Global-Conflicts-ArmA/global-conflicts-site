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
const { get } = require('http');
const trustedUploaderRoles = ['Admin', 'GM', 'Mission Maker'];

fileFilterFunction = async function (req, file, callback) {
	req = await getDiscordUserFromCookies(
		req,
		'User is not allowed to upload missions.'
	);

	if (req.authError) {
		return callback(null, false);
	}
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
				`${process.env.ROOT_FOLDER}${process.env.ARCHIVE}/${file.originalname}`
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
			cb(null, `${process.env.ROOT_FOLDER}/${process.env.ARCHIVE}`);
		},
		filename: function (req, file, cb) {
			cb(null, req.body.fileName);
		}
	})
});

updateFileFilterFunction = async function (req, file, callback) {
	req = await getDiscordUserFromCookies(
		req,
		'User is not allowed to upload missions.'
	);
	if (req.authError) {
		return callback(null, false);
	}
	console.log('req.body: ', req.body);
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
				`${process.env.ROOT_FOLDER}${process.env.ARCHIVE}/${file.originalname}`
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

const updateMulter = multer({
	limits: { fieldSize: 25 * 1024 * 1024 },
	fileFilter: updateFileFilterFunction,
	storage: multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, `${process.env.ROOT_FOLDER}/${process.env.ARCHIVE}`);
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
	if (!reqBody.lastVersion) {
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
	var img = Buffer.from(imageData, 'base64');
	const resizedBuffer = await sharp(img)
		.resize({
			fit: sharp.fit.contain,
			height: 256
		})
		.toBuffer()
		.catch((e) => {
			console.log('imageError', e);
		});
	return resizedBuffer;
}

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

async function postDiscord(reqBody, avatarURL) {
	const author = await getRemoteUser(reqBody.authorID)
		.then((result) => {
			return result.nickname
				? result.nickname
				: result.displayName
				? result.displayName
				: 'error';
		})
		.catch((err) => {
			console.log('err', err);
			return 'error';
		});
	const newMissionEmbed = new Discord.MessageEmbed()
		.setColor('#22cf26')
		.setTitle(reqBody.fileName)
		.setAuthor(`Author: ${author}`, avatarURL)
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

	if (reqBody.ratios) {
		let ratioStr = '';
		if (reqBody.ratios.blufor) {
			ratioStr = ratioStr + `**Blufor:** ${reqBody.ratios.blufor} `;
		}
		if (reqBody.ratios.opfor) {
			ratioStr = ratioStr + `**Opfor:** ${reqBody.ratios.opfor} `;
		}
		if (reqBody.ratios.indfor) {
			ratioStr = ratioStr + `**Indfor:** ${reqBody.ratios.indfor} `;
		}
		if (reqBody.ratios.civ) {
			ratioStr = ratioStr + `**Civ:** ${reqBody.ratios.civ} `;
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
		changeLog: req.body.updates[0].changeLog
	};

	const mission = {
		uniqueName: req.body.uniqueName,
		name: req.body.name,
		authorID: req.body.authorID,
		terrain: req.body.terrain,
		type: req.body.type,
		size: req.body.size,
		description: req.body.description,
		jip: req.body.jip,
		respawn: req.body.respawn,
		tags: req.body.tags,
		timeOfDay: req.body.timeOfDay,
		era: req.body.era,
		uploadDate: Date.now(),
		lastUpdate: Date.now(),
		updates: [firstUpdate],
		lastVersion: req.body.lastVersion,
		reports: req.body.reports,
		reviews: req.body.reviews
	};
	if (req.body.ratios) {
		mission.ratios = req.body.ratios;
	}
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
	Mission.find({}, { _id: 0 }, async (err, doc) => {
		if (err) {
			res.status(500).send(err);
		} else {
			return doc;
		}
	})
		.lean()
		.then((missions) => {
			missions.forEach((mission) => {
				if (mission && mission.updates) {
					mission.updates.forEach((update) => {
						update.main = fs.existsSync(
							`${process.env.ROOT_FOLDER}${process.env.MAIN_SERVER_MPMissions}/${update.fileName}`
						);
						update.test = fs.existsSync(
							`${process.env.ROOT_FOLDER}${process.env.TEST_SERVER_MPMissions}/${update.fileName}`
						);
						update.ready = fs.existsSync(
							`${process.env.ROOT_FOLDER}${process.env.TEST_SERVER_READY}/${update.fileName}`
						);
						update.archive = fs.existsSync(
							`${process.env.ROOT_FOLDER}${process.env.ARCHIVE}/${update.fileName}`
						);
					});
				}
			});
			res.json(missions);
		})
		.catch((err) => {
			console.log('err: ', err);
			res.status(500).send(err);
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
	Mission.findOne({ uniqueName: req.params.uniqueName }, (err, doc) => {
		if (err) {
			res.status(500).send(err);
		} else {
			return doc;
		}
	})
		.lean()
		.then((mission) => {
			if (mission && mission.updates) {
				mission.updates.forEach((update) => {
					update.main = fs.existsSync(
						`${process.env.ROOT_FOLDER}${process.env.MAIN_SERVER_MPMissions}/${update.fileName}`
					);
					update.test = fs.existsSync(
						`${process.env.ROOT_FOLDER}${process.env.TEST_SERVER_MPMissions}/${update.fileName}`
					);
					update.ready = fs.existsSync(
						`${process.env.ROOT_FOLDER}${process.env.TEST_SERVER_READY}/${update.fileName}`
					);
					update.archive = fs.existsSync(
						`${process.env.ROOT_FOLDER}${process.env.ARCHIVE}/${update.fileName}`
					);
				});
			}
			res.json(mission);
		})
		.catch((err) => {
			console.log('err: ', err);
			res.status(500).send(err);
		});
});

router.post('/report', uploadMulter.none(), async (req, res) => {
	req = await getDiscordUserFromCookies(
		req,
		'User not allowed to list missions.'
	);
	if (req.authError) {
		return res.status(401).send({
			authError: req.authError
		});
	}
	const report = {
		version: req.body.data.version,
		authorID: req.body.data.authorID,
		date: req.body.data.date,
		report: req.body.data.report
	};
	if (req.body.data.log) {
		report.log = req.body.data.log;
	}
	const options = {
		upsert: true,
		safe: true,
		new: true
	};
	const query = { uniqueName: req.body.uniqueName };
	Mission.findOneAndUpdate(query, {}, options, (err, missionData) => {
		if (err) {
			console.log(err);
		} else {
			console.log('missionData.reports: ', missionData.reports);
			if (!missionData.reports) {
				missionData.reports = [report];
			} else {
				missionData.reports.push(report);
			}
			missionData.save((error2) => {
				if (error2) {
					console.log(error2);
				}
			});
			postDiscordReport(
				report,
				missionData,
				req.discordUser.user.displayAvatarURL()
			);
			return res.send({ ok: true });
		}
	});
});

function buildVersionStr(versionObj) {
	if (versionObj.major <= -1) {
		return 'General';
	}
	let versionStr = versionObj.major.toString();
	if (versionObj.minor) {
		versionStr = versionStr + versionObj.minor;
	}
	return versionStr;
}

async function postDiscordReport(report, missionData, avatarURL) {
	const author = await getRemoteUser(report.authorID)
		.then((result) => {
			return result.nickname
				? result.nickname
				: result.displayName
				? result.displayName
				: 'error';
		})
		.catch((err) => {
			console.log('err', err);
			return 'error';
		});
	const versionStr = buildVersionStr(report.version);
	const reportEmbed = new Discord.MessageEmbed()
		.setColor('#22cf26')
		.setTitle(`Mission: ${missionData.name}`)
		.setAuthor(`Author: ${author}`, avatarURL)
		.addFields({ name: 'Version:', value: versionStr, inline: false })
		.addFields({ name: 'Report:', value: report.report, inline: false })
		.setTimestamp(report.date)
		.setURL('')
		.setFooter('\u3000'.repeat(10 /*any big number works too*/) + '|');
	if (report.log) {
		reportEmbed.addField('Log:', `\`\`\`\n ${report.log} \n \`\`\``, false);
	}
	if (missionData.image) {
		const resizedBuffer = await getImage(missionData.image);
		let attachment = new Discord.MessageAttachment(
			resizedBuffer,
			'img.png'
		);
		reportEmbed.attachFiles([attachment]);
		reportEmbed.setImage('attachment://img.png');
	}
	discordJsClient.channels.cache
		.get(process.env.DISCORD_BOT_CHANNEL)
		.send('New report added', reportEmbed);
}

router.post('/review', uploadMulter.none(), async (req, res) => {
	req = await getDiscordUserFromCookies(
		req,
		'User not allowed to list missions.'
	);
	if (req.authError) {
		return res.status(401).send({
			authError: req.authError
		});
	}
	const review = {
		version: req.body.data.version,
		authorID: req.body.data.authorID,
		date: req.body.data.date,
		review: req.body.data.review
	};
	const options = {
		upsert: true,
		safe: true,
		new: true
	};
	const query = { uniqueName: req.body.uniqueName };
	Mission.findOneAndUpdate(query, {}, options, (err, missionData) => {
		if (err) {
			console.log(err);
		} else {
			console.log('missionData.reviews: ', missionData.reviews);
			if (!missionData.reviews) {
				missionData.reviews = [review];
			} else {
				missionData.reviews.push(review);
			}
			missionData.save((error2) => {
				if (error2) {
					console.log(error2);
				}
			});
			postDiscordReview(
				review,
				missionData,
				req.discordUser.user.displayAvatarURL()
			);
			return res.send({ ok: true });
		}
	});
});

async function postDiscordReview(review, missionData, avatarURL) {
	const author = await getRemoteUser(review.authorID)
		.then((result) => {
			return result.nickname
				? result.nickname
				: result.displayName
				? result.displayName
				: 'error';
		})
		.catch((err) => {
			console.log('err', err);
			return 'error';
		});
	const versionStr = buildVersionStr(review.version);
	const reviewEmbed = new Discord.MessageEmbed()
		.setColor('#22cf26')
		.setTitle(`Mission: ${missionData.name}`)
		.setAuthor(`Author: ${author}`, avatarURL)
		.addFields({ name: 'Version:', value: versionStr, inline: false })
		.addFields({ name: 'Review:', value: review.review, inline: false })
		.setTimestamp(review.date)
		.setURL('')
		.setFooter('\u3000'.repeat(10 /*any big number works too*/) + '|');
	if (missionData.image) {
		const resizedBuffer = await getImage(missionData.image);
		let attachment = new Discord.MessageAttachment(
			resizedBuffer,
			'img.png'
		);
		reviewEmbed.attachFiles([attachment]);
		reviewEmbed.setImage('attachment://img.png');
	}
	discordJsClient.channels.cache
		.get(process.env.DISCORD_BOT_CHANNEL)
		.send('New review added', reviewEmbed);
}

router.post('/update', updateMulter.single('fileData'), async (req, res) => {
	req = await getDiscordUserFromCookies(
		req,
		'User not allowed to update mission.'
	);
	if (req.authError) {
		return res.status(401).send({
			authError: req.authError
		});
	}
	const update = {
		version: req.body.version,
		authorID: req.body.authorID,
		date: req.body.date,
		changeLog: req.body.changeLog,
		fileName: req.body.fileName
	};
	const options = {
		upsert: true,
		safe: true,
		new: true
	};
	const query = { uniqueName: req.body.uniqueName };
	Mission.findOneAndUpdate(query, {}, options, (err, missionData) => {
		if (err) {
			console.log(err);
		} else {
			console.log('missionData.updates: ', missionData.updates);
			missionData.updates.push(update);
			missionData.lastUpdate = update.date;
			missionData.lastVersion = update.version;
			missionData.save((error2) => {
				if (error2) {
					console.log(error2);
				}
			});
			postDiscordUpdate(
				update,
				missionData,
				req.discordUser.user.displayAvatarURL()
			);
			return res.send({ ok: true });
		}
	});
});

async function postDiscordUpdate(update, missionData, avatarURL) {
	const author = await getRemoteUser(update.authorID)
		.then((result) => {
			return result.nickname
				? result.nickname
				: result.displayName
				? result.displayName
				: 'error';
		})
		.catch((err) => {
			console.log('err', err);
			return 'error';
		});
	const versionStr = buildVersionStr(update.version);
	const updateEmbed = new Discord.MessageEmbed()
		.setColor('#22cf26')
		.setTitle(`Mission: ${missionData.name}`)
		.setAuthor(`Author: ${author}`, avatarURL)
		.addFields({ name: 'Version:', value: versionStr, inline: false })
		.addFields({
			name: 'Changelog:',
			value: `\`\`\`\n ${update.changeLog} \n \`\`\``,
			inline: false
		})
		.setTimestamp(update.date)
		.setURL('')
		.setFooter('\u3000'.repeat(10 /*any big number works too*/) + '|');
	if (missionData.image) {
		const resizedBuffer = await getImage(missionData.image);
		let attachment = new Discord.MessageAttachment(
			resizedBuffer,
			'img.png'
		);
		updateEmbed.attachFiles([attachment]);
		updateEmbed.setImage('attachment://img.png');
	}
	discordJsClient.channels.cache
		.get(process.env.DISCORD_BOT_CHANNEL)
		.send('Mission updated', updateEmbed);
}

router.post('/edit', updateMulter.none(), async (req, res) => {
	req = await getDiscordUserFromCookies(
		req,
		'User not allowed to update mission.'
	);
	if (req.authError) {
		return res.status(401).send({
			authError: req.authError
		});
	}
	const edit = req.body.data;
	const options = {
		upsert: true,
		safe: true,
		new: true
	};
	const query = { uniqueName: req.body.uniqueName };
	Mission.findOneAndUpdate(query, edit, options, (err, missionData) => {
		if (err) {
			console.log(err);
		} else {
			if (edit.image && edit.image === 'remove') {
				missionData.image = undefined;
				missionData.save((err2, doc) => {
					if (err2) {
						console.log(err);
					} else {
						postDiscordEdit(edit, doc, req.discordUser.user);
						return res.send({ ok: true });
					}
				});
			} else {
				postDiscordEdit(edit, missionData, req.discordUser.user);
				return res.send({ ok: true });
			}
		}
	});
});

async function postDiscordEdit(edit, missionData, user) {
	const author = await getRemoteUser(user.id)
		.then((result) => {
			return result.nickname
				? result.nickname
				: result.displayName
				? result.displayName
				: 'error';
		})
		.catch((err) => {
			console.log('err', err);
			return 'error';
		});
	const updateEmbed = new Discord.MessageEmbed()
		.setColor('#22cf26')
		.setTitle(`Mission: ${missionData.name}`)
		.setAuthor(`Author: ${author}`, user.displayAvatarURL())
		.setTimestamp(Date.now())
		.setURL('')
		.setFooter('\u3000'.repeat(10 /*any big number works too*/) + '|');
	if (edit.type) {
		updateEmbed.addField('Type:', edit.type, false);
	}
	if (edit.ratios) {
		let ratioStr = '';
		if (edit.ratios.blufor) {
			ratioStr = ratioStr + `**Blufor:** ${edit.ratios.blufor} `;
		}
		if (edit.ratios.opfor) {
			ratioStr = ratioStr + `**Opfor:** ${edit.ratios.opfor} `;
		}
		if (edit.ratios.indfor) {
			ratioStr = ratioStr + `**Indfor:** ${edit.ratios.indfor} `;
		}
		if (edit.ratios.civ) {
			ratioStr = ratioStr + `**Civ:** ${edit.ratios.civ} `;
		}
		updateEmbed.addField('Ratios:', ratioStr, false);
	}
	if (edit.size) {
		updateEmbed.addField(
			'Player Count:',
			`**Min:** ${edit.size.min} **Max:** ${edit.size.max}`,
			false
		);
	}
	if (edit.description) {
		updateEmbed.addField('Description:', edit.description, false);
	}
	if (edit.jip) {
		updateEmbed.addField('JiP:', edit.jip, false);
	}
	if (edit.respawn) {
		updateEmbed.addField('Respawn:', edit.respawn, false);
	}
	if (edit.tags) {
		updateEmbed.addField('Tags:', edit.tags.join(', '), false);
	}
	if (edit.timeOfDay) {
		updateEmbed.addField('Time of Day:', edit.timeOfDay, false);
	}
	if (edit.era) {
		updateEmbed.addField('Era:', edit.era, false);
	}
	if (edit.image) {
		if (edit.image === 'remove') {
			updateEmbed.addField('Image:', 'Image Removed', false);
		} else {
			updateEmbed.addField('Image:', 'Image Added', false);
		}
	}
	if (missionData.image) {
		const resizedBuffer = await getImage(missionData.image);
		let attachment = new Discord.MessageAttachment(
			resizedBuffer,
			'img.png'
		);
		updateEmbed.attachFiles([attachment]);
		updateEmbed.setImage('attachment://img.png');
	}
	discordJsClient.channels.cache
		.get(process.env.DISCORD_BOT_CHANNEL)
		.send('Mission details edited', updateEmbed);
}

router.post('/moveFile', updateMulter.none(), async (req, res) => {
	req = await getDiscordUserFromCookies(
		req,
		'User not allowed to move missions.'
	);
	if (req.authError) {
		return res.status(401).send({
			authError: req.authError
		});
	}
	const query = { uniqueName: req.body.uniqueName };
	const archivePath = `${process.env.ROOT_FOLDER}${process.env.ARCHIVE}/${req.body.filename}`;
	switch (req.body.mode) {
		case AddReady:
			const destPath = `${process.env.ROOT_FOLDER}${process.env.TEST_SERVER_READY}/${req.body.filename}`;
			fs.copyFile(filePath, destPath, fs.constants.COPYFILE_EXCL, err => {
				if (err) {
					console.log(err);
				} else {
					return res.send({ ok: true });
				}
			})
			break;
		case RemoveReady:
			const filePath = `${process.env.ROOT_FOLDER}${process.env.TEST_SERVER_READY}/${req.body.filename}`;
			fs.unlink(filePath, err => {
				if (err) {
					console.log(err);
				} else {
					return res.send({ ok: true });
				}
			})
			break;
		default:
			break;
	}
});

router.get('/download/:filename', async (req, res) => {
	req = await getDiscordUserFromCookies(
		req,
		'User not allowed to download missions.'
	);
	if (req.authError) {
		return res.status(401).send({
			authError: req.authError
		});
	}
	fs.readFile(
		`${process.env.ROOT_FOLDER}${process.env.ARCHIVE}/${req.params.filename}`,
		(err, data) => {
			if (err) {
				res.writeHead(404);
				res.end(JSON.stringify(err));
				return;
			}
			res.writeHead(200);
			res.end(data);
		}
	);
});

module.exports = router;
