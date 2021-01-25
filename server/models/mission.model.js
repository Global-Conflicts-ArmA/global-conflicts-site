const {mongooseConfig} = require('../config/mongoose-config');

const Schema = mongooseConfig.Schema;

const MissionSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	author: {
		type: String,
		required: true
	},
	authorID: {
		type: String,
		required: true
	},
	type: {
		type: String,
		required: true
	},
	terrain: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	maxPlayers: {
		type: Number,
		required: true
	},
	minPlayers: {
		type: Number,
		required: true
	},
	uploadDate: {
		type: Date,
		required: true
	},
	version: {
		type: Number,
		required: true
	},
	fileName: {
		type: String,
		required: true
	},
	paths: [{
		type: String,
		required: true
	}]
}, {
	versionKey: false
});

MissionSchema.index({fileName: 1}, {unique: true});

module.exports = mongooseConfig.model('mission', MissionSchema, 'missions');
