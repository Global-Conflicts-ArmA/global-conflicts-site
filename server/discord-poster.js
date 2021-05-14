const sharp = require('sharp');

const { discordJsClient, Discord } = require("./config/discord-bot");

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

async function getRemoteUserDisplayName(authorID) {
	return await getRemoteUser(authorID)
		.then((result) => {
			return result.nickname
				? result.nickname
				: result.displayName
				? result.displayName
				: "error";
		})
		.catch((err) => {
			console.log("err", err);
			return "error";
		});
}

function buildVersionStr(versionObj) {
	if (versionObj.major <= -1) {
		return "General";
	}
	let versionStr = versionObj.major.toString();
	if (versionObj.minor) {
		versionStr = versionStr + versionObj.minor;
	}
	return versionStr;
}

async function getImage(base64Image) {
	let parts = base64Image.split(";");
	let mimType = parts[0].split(":")[1];
	let imageData = parts[1].split(",")[1];
	var img = Buffer.from(imageData, "base64");
	const resizedBuffer = await sharp(img)
		.resize({
			fit: sharp.fit.contain,
			height: 256
		})
		.toBuffer()
		.catch((e) => {
			console.log("imageError", e);
		});
	return resizedBuffer;
}

async function postDiscordNewMission(reqBody, avatarURL) {
	const author = await getRemoteUserDisplayName(reqBody.authorID);

	const newMissionEmbed = new Discord.MessageEmbed()
		.setColor("#ffffff")
		.setTitle(reqBody.fileName)
		.setAuthor(`Author: ${author}`, avatarURL)
		.addFields(
			{ name: "Description:", value: reqBody.description, inline: false },
			{
				name: "Player Count:",
				value: `**Min:** ${reqBody.size.min} **Max:** ${reqBody.size.max}`,
				inline: true
			},
			{ name: "Type:", value: reqBody.type, inline: true },
			{ name: "Terrain:", value: reqBody.terrain, inline: true },
			{ name: "Time of Day:", value: reqBody.timeOfDay, inline: true },
			{ name: "Era:", value: reqBody.era, inline: true },
			{
				name: "Tags:",
				value: reqBody.tags.join(", "),
				inline: false
			}
		)
		.setTimestamp()
		.setURL(`https://globalconflicts.net//mission-details/${reqBody.uniqueName}`)

	if (reqBody.ratios) {
		let ratioStr = "";
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
		newMissionEmbed.addField("Ratios:", ratioStr, false);
	}

	if (reqBody.image) {
		const resizedBuffer = await getImage(reqBody.image);
		let attachment = new Discord.MessageAttachment(
			resizedBuffer,
			"img.png"
		);
		newMissionEmbed.attachFiles([attachment]);
		newMissionEmbed.setImage("attachment://img.png");
	}

	discordJsClient.channels.cache
		.get(process.env.DISCORD_BOT_CHANNEL)
		.send("New mission uploaded", newMissionEmbed);
}

async function postDiscordMissionReady(request, mission, updateid) {


	const author = await getRemoteUserDisplayName(mission.authorID);
	const update = mission.updates.filter((updt) => updt._id.toString() === updateid)[0];

	const newMissionEmbed = new Discord.MessageEmbed()
		.setColor("#22cf26")
		.setTitle(`${mission.name}`)
		.setAuthor(
			`Author: ${author}`,
			request.discordUser.user.displayAvatarURL()
		)
		.addFields()
		.setDescription(
			`${mission.name} V${buildVersionStr(
				update.version
			)} was marked as ready to be uploaded to the main server.`
		)
		.setTimestamp()
		.setURL(
			`${request.headers.origin}/mission-details/${mission.uniqueName}`
		);

	discordJsClient.channels.cache
		.get(process.env.DISCORD_BOT_CHANNEL)
		.send(
			`<@&${process.env.DISCORD_ADMIN_ROLE_ID}>, a mission marked as ready.`,
			newMissionEmbed
		);
}

async function postDiscordReport(report, missionData, avatarURL) {
	const author = await getRemoteUser(report.authorID)
		.then((result) => {
			return result.nickname
				? result.nickname
				: result.displayName
				? result.displayName
				: "error";
		})
		.catch((err) => {
			console.log("err", err);
			return "error";
		});
	const versionStr = buildVersionStr(report.version);
	const reportEmbed = new Discord.MessageEmbed()
		.setColor("#ff0000")
		.setTitle(`Mission: ${missionData.name}`)
		.setAuthor(`Bug Report Author: ${author}`, avatarURL)
		.addFields({ name: "Version:", value: versionStr, inline: false })
		.addFields({ name: "Report:", value: report.report, inline: false })
		.setTimestamp(report.date)
		.setURL(`https://globalconflicts.net/mission-details/${missionData.uniqueName}`)
	if (report.log) {
		reportEmbed.addField("Log:", `\`\`\`\n ${report.log} \n \`\`\``, false);
	}
	if (missionData.image) {
		const resizedBuffer = await getImage(missionData.image);
		let attachment = new Discord.MessageAttachment(
			resizedBuffer,
			"img.png"
		);
		reportEmbed.attachFiles([attachment]);
		reportEmbed.setImage("attachment://img.png");
	}
	discordJsClient.channels.cache
		.get(process.env.DISCORD_BOT_CHANNEL)
		.send("New bug report added", reportEmbed);
}

async function postDiscordReview(review, missionData, avatarURL) {
	const author = await getRemoteUser(review.authorID)
		.then((result) => {
			return result.nickname
				? result.nickname
				: result.displayName
				? result.displayName
				: "error";
		})
		.catch((err) => {
			console.log("err", err);
			return "error";
		});
	const versionStr = buildVersionStr(review.version);
	const reviewEmbed = new Discord.MessageEmbed()
		.setColor("#2261cf")
		.setTitle(`Mission: ${missionData.name}`)
		.setAuthor(`Review Author: ${author}`, avatarURL)
		.addFields({ name: "Version:", value: versionStr, inline: false })
		.addFields({ name: "Review:", value: review.review, inline: false })
		.setTimestamp(review.date)
		.setURL(`https://globalconflicts.net//mission-details/${missionData.uniqueName}`)
	if (missionData.image) {
		const resizedBuffer = await getImage(missionData.image);
		let attachment = new Discord.MessageAttachment(
			resizedBuffer,
			"img.png"
		);
		reviewEmbed.attachFiles([attachment]);
		reviewEmbed.setImage("attachment://img.png");
	}
	discordJsClient.channels.cache
		.get(process.env.DISCORD_BOT_CHANNEL)
		.send("New review added", reviewEmbed);
}

async function postDiscordUpdate(update, missionData, avatarURL) {
	const author = await getRemoteUser(missionData.authorID)
		.then((result) => {
			return result.nickname
				? result.nickname
				: result.displayName
				? result.displayName
				: "error";
		})
		.catch((err) => {
			console.log("err", err);
			return "error";
		});
	const versionStr = buildVersionStr(update.version);
	let updateEmbed;
	updateEmbed = new Discord.MessageEmbed()
		.setColor("#ffffff")
		.setTitle(`Mission: ${missionData.name}`)
		.setAuthor(`Author: ${author}`, avatarURL)
		.addFields({ name: "Version:", value: versionStr, inline: false })
		.addFields({
			name: "Changelog:",
			value: `\`\`\`\n ${update.changeLog} \n \`\`\``,
			inline: false
		})
		.setTimestamp(update.date)
		.setURL(`globalconflicts.net/mission-details/${missionData.uniqueName}`)
	if (missionData.image) {
		const resizedBuffer = await getImage(missionData.image);
		let attachment = new Discord.MessageAttachment(
			resizedBuffer,
			"img.png"
		);
		updateEmbed.attachFiles([attachment]);
		updateEmbed.setImage("attachment://img.png");
	}
	discordJsClient.channels.cache
		.get(process.env.DISCORD_BOT_CHANNEL)
		.send("Mission updated", updateEmbed);
}

async function postDiscordEdit(edit, missionData, user) {
	const author = await getRemoteUser(missionData.authorID)
		.then((result) => {
			return result.nickname
				? result.nickname
				: result.displayName
				? result.displayName
				: "error";
		})
		.catch((err) => {
			console.log("err", err);
			return "error";
		});
	const updateEmbed = new Discord.MessageEmbed()
		.setColor("#c946ff")
		.setTitle(`Mission: ${missionData.name}`)
		.setAuthor(`Author: ${author}`, user.displayAvatarURL())
		.setTimestamp(Date.now())
		.setURL(`https://globalconflicts.net//mission-details/${missionData.uniqueName}`)
	if (edit.type) {
		updateEmbed.addField("Type:", edit.type, false);
	}
	if (edit.ratios) {
		let ratioStr = "";
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
		updateEmbed.addField("Ratios:", ratioStr, false);
	}
	if (edit.size) {
		updateEmbed.addField(
			"Player Count:",
			`**Min:** ${edit.size.min} **Max:** ${edit.size.max}`,
			false
		);
	}
	if (edit.description) {
		updateEmbed.addField("Description:", edit.description, false);
	}
	if (edit.jip) {
		updateEmbed.addField("JIP:", edit.jip?"YES":"NO", false);
	}
	if (edit.respawn) {
		updateEmbed.addField("Respawn:", edit.respawn?"YES":"NO", false);
	}
	if (edit.tags) {
		updateEmbed.addField("Tags:", edit.tags.join(", "), false);
	}
	if (edit.timeOfDay) {
		updateEmbed.addField("Time of Day:", edit.timeOfDay, false);
	}
	if (edit.era) {
		updateEmbed.addField("Era:", edit.era, false);
	}
	if (edit.image) {
		if (edit.image === "remove") {
			updateEmbed.addField("Image:", "Image Removed", false);
		} else {
			updateEmbed.addField("Image:", "Image Added", false);
		}
	}
	if (missionData.image) {
		const resizedBuffer = await getImage(missionData.image);
		let attachment = new Discord.MessageAttachment(
			resizedBuffer,
			"img.png"
		);
		updateEmbed.attachFiles([attachment]);
		updateEmbed.setImage("attachment://img.png");
	}
	discordJsClient.channels.cache
		.get(process.env.DISCORD_BOT_CHANNEL)
		.send("Mission details edited", updateEmbed);
}

async function postMissionCopiedRemovedToServer(request, mission, updateid, serverName, action, color) {
	const author = await getRemoteUserDisplayName(mission.authorID);
	const update = mission.updates.filter((updt) => updt._id.toString() === updateid)[0];

	const newMissionEmbed = new Discord.MessageEmbed()
		.setColor(color)
		.setTitle(`${mission.name}`)
		.setAuthor(
			`Author: ${author}`,
			request.discordUser.user.displayAvatarURL()
		)
		.addFields()
		.setDescription(
			`${mission.name} V${buildVersionStr(
				update.version
			)} was ${action} the ${serverName} server.`
		)
		.setTimestamp()
		.setURL(
			`${request.headers.origin}/mission-details/${mission.uniqueName}`
		);

	discordJsClient.channels.cache
		.get(process.env.DISCORD_BOT_CHANNEL)
		.send(
			`A mission was ${action} the ${serverName} server.`,
			newMissionEmbed
		);
}

module.exports = {
	postDiscordNewMission,
	postDiscordReport,
	postDiscordReview,
	postDiscordUpdate,
	postDiscordEdit,
	postDiscordMissionReady,
	postMissionCopiedRemovedToServer
};
