const { mongooseConfig } = require('../config/mongoose-config');
const Schema = mongooseConfig.Schema;

const MissionSchema = new Schema(
	{
		uniqueName: {
			type: String,
			required: true
		},
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
		terrain: {
			type: String,
			required: true
		},
		type: {
			type: String,
			required: true
		},
		size: [Number],
		ratios: [Number],
		description: {
			type: String,
			required: true
		},
		tags: [String],
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
		lastUpdate: {
			type: Date,
			required: true
		},
		updates: [
			{
				version: {
					type: Number,
					required: true
				},
				authorID: {
					type: String,
					required: true
				},
				date: {
					type: String,
					required: true
				},
				changeLog: {
					type: String,
					required: false
				},
				addressesReports: [{
					type: String,
					required: false
				}],
				fileName: {
					type: String,
					required: true
				},
				path: {
					type: String,
					required: true
				}
			}
		],
		version: {
			type: Number,
			required: true
		},
		reports: [
			{
				date: {
					type: String,
					required: true
				},
				authorID: {
					type: String,
					required: true
				},
				report: {
					type: String,
					required: true
				},
				version: {
					type: Number,
					required: true
				}
			}
		],
		reviews: [
			{
				date: {
					type: String,
					required: true
				},
				authorID: {
					type: String,
					required: true
				},
				review: {
					type: String,
					required: true
				},
				version: {
					type: Number,
					required: true
				}
			}
		]
	},
	{
		versionKey: false
	}
);

MissionSchema.index({ uniqueName: 1 }, { unique: true });

module.exports = mongooseConfig.model('mission', MissionSchema, 'missions');
