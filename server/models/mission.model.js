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
	fileName: {
		type: String,
		required: true
	},
	terrain: {
		type: String,
		required: true
	},
	type: {
		type: String,
		required: true
	},
	size: {
		type: Array,
		required: true
	},
	ratios: {
		type: Array,
		required: false
	},
	description: {
		type: String,
		required: true
	},
	tags: {
		type: Array,
		required: true
	},
	timeOfDay: {
		type: String,
		required: true
	},
	era: {
		type: String,
		required: true
	},
	image: {
		type: String,
		required: false
	},
	uploadDate: {
		type: Date,
		required: true
	},
	updates: [{
		type: Array,
		required: false
	}],
	version: {
		type: Number,
		required: true
	},
	paths: [{
		type: String,
		required: true
	}],
	reports: [{
		type: Array,
		required: false
	}],
	reviews: [{
		type: Array,
		required: false
	}],
}, {
	versionKey: false
});

MissionSchema.index({fileName: 1}, {unique: true});

module.exports = mongooseConfig.model('mission', MissionSchema, 'missions');
