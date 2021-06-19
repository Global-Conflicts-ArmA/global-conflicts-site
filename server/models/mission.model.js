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
		ratios: {
			blufor: {
				type: Number,
				required: false
			},
			opfor: {
				type: Number,
				required: false
			},
			indfor: {
				type: Number,
				required: false
			},
			civ: {
				type: Number,
				required: false
			}
		},
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
		reviewState: {
			type: String,
			required: false
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
		lastPlayed: {
			type: Date,
			required: false
		},
		history: [
			{
				date: {
					type: Date,
					required: true
				},
				outcome: {
					type: String,
					required: false
				},
				gmNote: {
					type: String,
					required: false
				},
				aarReplayLink: {
					type: String,
					required: false
				},
				leaders: [
					{
						discordID: {
							type: String,
							required: true
						},
						side: {
							type: String,
							required: false
						},
						role: {
							type: String,
							required: false
						},
						aar: {
							type: String,
							required: false
						}
					}
				]
			}
		],
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
					major: {
						type: Number,
						required: true
					},
					minor: {
						type: String,
						required: false
					}
				}
			}
		],
		votes: [String] // unique array of discordIDs. Is reseted every monday.
	},
	{
		versionKey: false
	}
);

MissionSchema.index({ uniqueName: 1 }, { unique: true });

module.exports = mongooseConfig.model("mission", MissionSchema, "missions");
