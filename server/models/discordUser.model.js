const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const discordUserSchema = new Schema(
	{
		discordId: {
			type: String,
			required: true,
			unique: true
		},
		avatar: {
			type: String,
			required: true
		},
		isAdmin: {
			type: Boolean,
			required: false
		},
		missions: {
			type: Array,
			required: false
		},
		reports: {
			type: Array,
			required: false
		},
		reviews: {
			type: Array,
			required: false
		},
		userSettings: {
			type: Array,
			required: false
		}
	},
	{
		versionKey: false
	}
);

module.exports = mongoose.model(
	'discordUser',
	discordUserSchema,
	'discordUser'
);
