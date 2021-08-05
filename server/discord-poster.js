const sharp = require('sharp');

REVIEW_STATE_PENDING = 'review_pending';
REVIEW_STATE_REPROVED = 'review_reproved';
REVIEW_STATE_ACCEPTED = 'review_accepted';
REVIEW_STATE_ACCEPTS_WITH_CAVEATS = 'review_accepted_with_caveats';

const { discordJsClient, Discord } = require('./config/discord-bot');

const disbut = require("discord-buttons");

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

async function getImage(base64Image) {
	let parts = base64Image.split(';');
	let imageData = parts[1].split(',')[1];
	const img = Buffer.from(imageData, 'base64');
	return await sharp(img)
		.resize({
			fit: sharp.fit.contain,
			height: 256
		})
		.toBuffer()
		.catch((e) => {
			console.log('imageError', e);
		});
}

async function postDiscordNewMission(reqBody) {
	const author = await getRemoteUser(reqBody.authorID);

	const newMissionEmbed = new Discord.MessageEmbed()
		.setColor('#ffffff')
		.setTitle(reqBody.fileName)
		.setAuthor(
			`Author: ${author.displayName}`,
			author.user.displayAvatarURL()
		)
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
		.setURL(
			`https://globalconflicts.net//mission-details/${reqBody.uniqueName}`
		);

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

async function postDiscordMissionReady(request, mission, updateid) {
	const author = await getRemoteUser(mission.authorID);
	const update = mission.updates.filter(
		(updt) => updt._id.toString() === updateid
	)[0];

	const newMissionEmbed = new Discord.MessageEmbed()
		.setColor('#22cf26')
		.setTitle(`${mission.name}`)
		.setAuthor(
			`Author: ${author.displayName}`,
			author.user.displayAvatarURL()
		)
		.addFields()
		.setDescription(
			`${mission.name} V${buildVersionStr(
				update.version
			)} was marked as ready to be uploaded to the main server.`
		)
		.setTimestamp()
		.setURL(
			`https://globalconflicts.net/mission-details/${mission.uniqueName}`
		);

	discordJsClient.channels.cache
		.get(process.env.DISCORD_BOT_CHANNEL)
		.send(
			`<@&${process.env.DISCORD_MISSION_REVIEW_TEAM_ROLE_ID}>, a mission marked as ready.`,
			newMissionEmbed
		);
}

async function postDiscordAskForReview(request, mission, updateid) {
	const author = await getRemoteUser(mission.authorID);
	const update = mission.updates.filter(
		(updt) => updt._id.toString() === updateid
	)[0];

	const newMissionEmbed = new Discord.MessageEmbed()
		.setColor('#22cf26')
		.setTitle(`${mission.name}`)
		.setAuthor(
			`Author: ${author.displayName}`,
			author.user.displayAvatarURL()
		)
		.addFields()
		.setDescription(`Version: ${buildVersionStr(update.version)}.`)
		.setTimestamp()
		.setURL(
			`https://globalconflicts.net/mission-details/${mission.uniqueName}`
		);

	discordJsClient.channels.cache
		.get(process.env.DISCORD_BOT_MISSION_REVIEWER_CHANNEL)
		.send(
			`<@&${process.env.DISCORD_MISSION_REVIEW_TEAM_ROLE_ID}>, a mission review has been requested.`,
			newMissionEmbed
		);
}

async function postDiscordReport(report, missionData) {
	const author = await getRemoteUser(report.authorID);

	const versionStr = buildVersionStr(report.version);
	const reportEmbed = new Discord.MessageEmbed()
		.setColor('#ff0000')
		.setTitle(`Mission: ${missionData.name}`)
		.setAuthor(
			`Bug Report Author: ${author.displayName}`,
			author.user.displayAvatarURL()
		)
		.addFields({ name: 'Version:', value: versionStr, inline: false })
		.addFields({ name: 'Report:', value: report.report, inline: false })
		.setTimestamp(report.date)
		.setURL(
			`https://globalconflicts.net/mission-details/${missionData.uniqueName}`
		);
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
		.send(`New bug report added, <@${missionData.authorID}>`, reportEmbed);
}

async function postDiscordReview(review, missionData) {
	const author = await getRemoteUser(review.authorID);

	const versionStr = buildVersionStr(review.version);
	const reviewEmbed = new Discord.MessageEmbed()
		.setColor('#2261cf')
		.setTitle(`Mission: ${missionData.name}`)
		.setAuthor(
			`Review Author: ${author.displayName}`,
			author.user.displayAvatarURL()
		)
		.addFields({ name: 'Version:', value: versionStr, inline: false })
		.addFields({ name: 'Review:', value: review.review, inline: false })
		.setTimestamp(review.date)
		.setURL(
			`https://globalconflicts.net/mission-details/${missionData.uniqueName}`
		);
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
		.send(`New review added, <@${missionData.authorID}>`, reviewEmbed);
}

async function postDiscordUpdate(update, missionData) {
	const author = await getRemoteUser(missionData.authorID);

	const versionStr = buildVersionStr(update.version);
	let updateEmbed;
	updateEmbed = new Discord.MessageEmbed()
		.setColor('#ffffff')
		.setTitle(`Mission: ${missionData.name}`)
		.setAuthor(
			`Author: ${author.displayName}`,
			author.user.displayAvatarURL()
		)
		.addFields({ name: 'Version:', value: versionStr, inline: false })
		.addFields({
			name: 'Changelog:',
			value: `\`\`\`\n ${update.changeLog} \n \`\`\``,
			inline: false
		})
		.setTimestamp(update.date)
		.setURL(
			`https://globalconflicts.net/mission-details/${missionData.uniqueName}`
		);
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

async function postDiscordEdit(edit, missionData) {
	const author = await getRemoteUser(missionData.authorID);

	const updateEmbed = new Discord.MessageEmbed()
		.setColor('#c946ff')
		.setTitle(`Mission: ${missionData.name}`)
		.setAuthor(
			`Author: ${author.displayName}`,
			author.user.displayAvatarURL()
		)
		.setTimestamp(Date.now())
		.setURL(
			`https://globalconflicts.net//mission-details/${missionData.uniqueName}`
		);
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
		updateEmbed.addField('JIP:', edit.jip ? 'YES' : 'NO', false);
	}
	if (edit.respawn) {
		updateEmbed.addField('Respawn:', edit.respawn ? 'YES' : 'NO', false);
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

async function postMissionCopiedRemovedToServer(
	request,
	mission,
	updateid,
	serverName,
	action,
	color
) {
	const author = await getRemoteUser(mission.authorID);
	const update = mission.updates.filter(
		(updt) => updt._id.toString() === updateid
	)[0];

	const newMissionEmbed = new Discord.MessageEmbed()
		.setColor(color)
		.setTitle(`${mission.name}`)
		.setAuthor(
			`Author: ${author.displayName}`,
			author.user.displayAvatarURL()
		)
		.setDescription(
			`${mission.name} V${buildVersionStr(
				update.version
			)} was ${action} the ${serverName} server.`
		)
		.setTimestamp()
		.setURL(
			`https://globalconflicts.net/mission-details/${mission.uniqueName}`
		);

	discordJsClient.channels.cache
		.get(process.env.DISCORD_BOT_CHANNEL)
		.send(
			`A mission was ${action} the ${serverName} server.`,
			newMissionEmbed
		);
}

async function postNewMissionHistory(request, mission, history, isNew) {
	const author = await getRemoteUser(mission.authorID);

	let leadersDescriptionText;
	let leadersFieldText;

	leadersDescriptionText = history.leaders
		.map(function (elem) {
			return `<@${elem.discordID}>`;
		})
		.join(', ');

	leadersFieldText = history.leaders
		.map(function (elem) {
			return `<@${elem.discordID}>`;
		})
		.join('\n');

	let leaderText = 'Leader:';
	if (history.leaders.length > 1) {
		leaderText = 'Leaders:';
	}
	let sendText = `New mission history recorded!\n${leadersDescriptionText}: please consider giving your AAR at the website.`;
	if (!isNew) {
		sendText = `A mission history was edited. \n${leadersDescriptionText}: Check it out.`;
	}

	const gameplayHistoryEmbed = new Discord.MessageEmbed()
		.setTitle(`${mission.name}`)
		.setDescription(mission.description)
		.setAuthor(
			`Author: ${author.displayName}`,
			author.user.displayAvatarURL()
		)
		.addField('Outcome:', history.outcome)
		.setURL(
			`https://globalconflicts.net/mission-details/${mission.uniqueName}`
		);

	if (history.gmNote) {
		gameplayHistoryEmbed.addField('GM Notes:', history.gmNote);
	}
	if (history.aarReplayLink) {
		gameplayHistoryEmbed.addField('AAR Replay:', history.aarReplayLink);
	}
	gameplayHistoryEmbed.addField(leaderText, leadersFieldText);

	discordJsClient.channels.cache
		.get(process.env.DISCORD_BOT_AAR_CHANNEL)
		.send(sendText, gameplayHistoryEmbed);
}

async function postNewAAR(request, mission, outcome, leader, aarText) {
	const author = await getRemoteUser(mission.authorID);

	let sendText = `New AAR submited!\n <@${mission.authorID}>, this is your mission, take a look at the AAR.`;

	let sidePositionString;

	if (leader.role === 'took_command') {
		sidePositionString = `Took ${leader.side} command`;
	} else {
		sidePositionString = `${leader.side} leader`;
	}
	if (aarText.length > 300) {
		aarText = aarText.substring(0, 300) + '...';
	}

	aarText = [
		`<@${leader.discordID}>, **${sidePositionString} AAR**:\n` + aarText
	].join('');

	const aarEmbed = new Discord.MessageEmbed()
		.setTitle(`${mission.name}`)
		.setDescription(aarText)
		.setAuthor(
			`Author: ${author.displayName}`,
			author.user.displayAvatarURL()
		)
		.addField('Outcome:', outcome)
		.setURL(
			`https://globalconflicts.net/mission-details/${mission.uniqueName}`
		);

	discordJsClient.channels.cache
		.get(process.env.DISCORD_BOT_AAR_CHANNEL)
		.send(sendText, aarEmbed);
}

async function postMissionAuditSubmited(
	request,
	mission,
	updateid,
	status,
	checklist,
	notes
) {
	const author = await getRemoteUser(mission.authorID);
	const update = mission.updates.filter(
		(updt) => updt._id.toString() === updateid
	)[0];

	if (status === REVIEW_STATE_REPROVED) {
		status = 'reproved';
	} else {
		status = 'approved';
	}

	const newMissionEmbed = new Discord.MessageEmbed()
		.setColor(`${status === 'reproved' ? '#ff0000' : '#56ff3b'}`)
		.setTitle(`${mission.name}`)
		.setAuthor(
			`Author: ${author.displayName}`,
			author.user.displayAvatarURL()
		)
		.addField('Reviewer', `<@${request.discordUser.user.id}>`)
		.setDescription(
			`Version: ${buildVersionStr(update.version)}
			${
				notes != null
					? `**Notes**:
			----------------------------------------------------------------------
			${notes}
			----------------------------------------------------------------------
			`
					: ''
			}
		`
		)
		.setTimestamp()
		.setURL(
			`https://globalconflicts.net/mission-details/${mission.uniqueName}`
		);
	if (status === 'reproved') {
		newMissionEmbed.setDescription(
			newMissionEmbed.description + '**These are the issues:**'
		);
		for (let checklistElement of checklist) {
			if (checklistElement.value === 'NO') {
				newMissionEmbed.addField(
					checklistElement.text,
					checklistElement.value
				);
			}
		}
	}
	if (status === 'reproved') {
		discordJsClient.channels.cache
			.get(process.env.DISCORD_BOT_CHANNEL)
			.send(
				`<@${author.user.id}>, your mission has been rejected. 🛑`,
				newMissionEmbed
			);
	} else {
		discordJsClient.channels.cache
			.get(process.env.DISCORD_BOT_CHANNEL)
			.send(
				`<@&${process.env.DISCORD_ADMIN_ROLE_ID}>, a mission was accepted to be uploaded:\n<@${author.user.id}>, your mission has been accepted. ✅`,
				newMissionEmbed
			);
	}
}

async function postFirstvoteForAMission(request, mission) {
	const author = await getRemoteUser(mission.authorID);

	const newMissionEmbed = new Discord.MessageEmbed()
		.setTitle(`${mission.name}`)
		.setAuthor(
			`Author: ${author.displayName}`,
			author.user.displayAvatarURL()
		)
		.setDescription(mission.description)
		.addFields(
			{
				name: 'Player Count:',
				value: `**Min:** ${mission.size.min} **Max:** ${mission.size.max}`,
				inline: true
			},
			{ name: 'Type:', value: mission.type, inline: true },
			{ name: 'Terrain:', value: mission.terrain, inline: true }
		)
		.setURL(
			`https://globalconflicts.net/mission-details/${mission.uniqueName}`
		);

	let button = new disbut.MessageButton()
		.setLabel("Vote for this mission")
		.setID(mission.uniqueName)
		.setStyle("blurple");


	discordJsClient.channels.cache
		.get(process.env.DISCORD_ARMA3_CHANNEL)
		.send(`This mission has received its first vote:`, { embed: newMissionEmbed, buttons: [button] });
}

module.exports = {
	postDiscordNewMission,
	postDiscordReport,
	postDiscordReview,
	postDiscordUpdate,
	postDiscordEdit,
	postDiscordMissionReady,
	postDiscordAskForReview,
	postMissionCopiedRemovedToServer,
	postNewMissionHistory,
	postNewAAR,
	postMissionAuditSubmited,
	postFirstvoteForAMission
};
