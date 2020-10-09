const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
  playercount: {
    type: Number,
    required: true
  },
  framework: {
    type: String,
    required: true
  },
  createDate: {
    type: Number,
    required: true
  },
  updateDate: {
    type: Number,
    required: true
  },
  version: {
    type: Number,
    required: true
  },
  tested: {
    type: Boolean,
    required: false
  },
  reportedBugs: {
    type: Array,
    required: false
  },
  onMainServer: {
    type: Boolean,
    required: false
  },
  onTestServer: {
    type: Boolean,
    required: false
  }
}, {
  versionKey: false
});


module.exports = mongoose.model('mission', MissionSchema, 'missions');
