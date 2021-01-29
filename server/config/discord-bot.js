const Discord = require('discord.js')
const Mission = require('../models/mission.model');
const fs = require('fs');
const discordJsClient = new Discord.Client();

let isReady = false;


discordJsClient.once('ready', function () {
	isReady = true;
	// tslint:disable-next-line:no-console
	console.log("DISCORD BOT READY")

	discordJsClient.on('message', message => {

		if (!message.content.startsWith(process.env.DISCORD_BOT_PREFIX) || message.author.bot || message.channel.id !== '766045008972480592' || !message.member.roles.cache.has("635885925003690006")) return;

		const args = message.content.slice(process.env.DISCORD_BOT_PREFIX.length).trim().split(' ');
		const command = args.shift().toLowerCase();
		if (command === 'cm') {
			if (args.length !== 2) {
				return message.channel.send('command usage: cm **<source-folder>/<mission-name.pbo>** **<destination-folder>/<mission-name.pbo>**  ');
			}
			const source = args[0];
			const destination = args[1];

			const missionNameSourceSplit = source.split('/')
			const missionNameSource = missionNameSourceSplit[missionNameSourceSplit.length - 1]

			const missionNameDestinationSplit = destination.split('/')
			const missionNameDestination = missionNameDestinationSplit[missionNameDestinationSplit.length - 1]

			if (missionNameDestination !== missionNameSource) {
				message.channel.send(`Mission names are different! They must match.`);
				return;
			}
			message.channel.send(`Copying mission: **${source}** to **${destination}**...`).then(copyingMissionMessage => {


				fs.copyFile(source, destination, (err) => {
					if (err) {
						copyingMissionMessage.edit(`Error copying mission:\n${err.message}`);
					} else {
						copyingMissionMessage.edit(`Mission copied! | Updating database...`).then(sentMessage => {
							Mission.updateOne({fileName: missionNameDestination}, {
								$addToSet: {paths: destination}
								}, (err, docs) => {
									if (err) {
										copyingMissionMessage.edit(`Mission copied! | Database update failed: ${err}`)
									} else {
										copyingMissionMessage.edit(`Mission copied! | Database updated!`)
									}
								});
						});
					}
				})


			})


		}

		if (command === 'cmm') {
			if (args.length !== 1) {
				return message.channel.send('command usage: cmm **<mission-name>**');
			}
			const missionName = args[0];
			message.channel.send(`Copying mission from **test server MPMissions** to **main server MPMissions**:\n*${missionName}*`).then(copyingMissionMessage => {
				fs.copyFile(`${process.env.ROOT_FOLDER}${process.env.TEST_SERVER_MPMissions}/${missionName}`, `${process.env.ROOT_FOLDER}${process.env.TEST_SERVER_MPMissions}/${missionName}`, (err) => {
					if (err) {
						copyingMissionMessage.edit(`Error copying mission:\n${err.message}`);
					} else {
						message.channel.send(`Mission copied! | Updating database...`).then(sentMessage => {
							Mission.updateOne({fileName: missionName}, {
								$addToSet: {paths: process.env.MAIN_SERVER_MPMissions}
							}, (err, docs) => {
								if (err) {
									sentMessage.edit(`Mission copied! | Database update failed: ${err}`)
								} else {
									sentMessage.edit(`Mission copied! | Database updated!`)
								}
							});
						});
					}
				})
			})


		}

		if (command === 'cmt') {
			if (args.length !== 1) {
				return message.channel.send('command usage: cmt **<mission-name>**');
			}
			const missionName = args[0];
			message.channel.send(`Copying mission from **test server READY** to **test server MPMissions**:\n*${missionName}*`);
			message.channel.send(`Copying mission from **test server READY** to **test server MPMissions**:\n*${missionName}*`).then(copyingMissionMessage => {
				fs.copyFile(`${process.env.ROOT_FOLDER}${process.env.TEST_SERVER_READY}${missionName}`, `${process.env.ROOT_FOLDER}${process.env.TEST_SERVER_MPMissions}${missionName}`, (err) => {
					if (err) {
						copyingMissionMessage.edit(`Error copying mission:\n${err.message}`);
					} else {
						copyingMissionMessage.edit(`Mission copied! | Updating database...`).then(sentMessage => {
							Mission.updateOne({fileName: missionName}, {
								$addToSet: {paths: process.env.TEST_SERVER_MPMissions}
							}, (err, docs) => {
								if (err) {
									copyingMissionMessage.edit(`Mission copied! | Database update failed: ${err}`)
								} else {
									copyingMissionMessage.edit(`Mission copied! | Database updated!`)
								}
							});
						});
					}
				})
			})


		}

	});

});


discordJsClient.login(process.env.DISCORD_BOT_TOKEN);

module.exports.discordJsClient = discordJsClient;
module.exports.Discord = Discord;
