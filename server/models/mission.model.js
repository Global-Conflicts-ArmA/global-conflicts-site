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
		size: {
			min: {
				type: Number,
				required: true
			},
			max: {
				type: Number,
				required: true
			}
		},
		ratios: [Number],
		description: {
			type: String,
			required: true
		},
		jip: {
			type: Boolean,
			required: true
		},
		respawn: {
			type: Boolean,
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
					major: {
						type: Number,
						required: true
					},
					minor: {
						type: String,
						required: false
					}
				},
				authorID: {
					type: String,
					required: true
				},
				date: {
					type: Date,
					required: true
				},
				changeLog: {
					type: String,
					required: false
				},
				addressesReports: [
					{
						type: String,
						required: false
					}
				],
				fileName: {
					type: String,
					required: true
				}
			}
		],
		lastVersion: {
			major: {
				type: Number,
				required: true
			},
			minor: {
				type: String,
				required: false
			}
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
				log: {
					type: String,
					required: false
				},
				version: {
					major: {
						type: Number,
						required: true
					},
					minor: {
						type: String,
						required: false
					}
				},
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
					major: {
						type: Number,
						required: true
					},
					minor: {
						type: String,
						required: false
					}
				},
			}
		]
	},
	{
		versionKey: false
	}
);

MissionSchema.index({ uniqueName: 1 }, { unique: true });

module.exports = mongooseConfig.model('mission', MissionSchema, 'missions');
