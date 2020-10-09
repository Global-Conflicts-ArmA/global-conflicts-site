const mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
	id: {
		type: String,
		required: true,
		unique: true
	},
	username: {
		type: String,
		required: true
	},
	avatar: {
		type: String,
		required: true
	},
	avatarLink: {
		type: String,
		required: true
	},
	discriminator: {
		type: String,
		required: true
	},
	locale: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true,
		// Regexp to validate emails with more strict rules as added in tests/users.js which also conforms mostly with RFC2822 guide lines
		match: [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter a valid email'],
	},
	isAdmin: {
		type: Boolean,
		required: false
	}
}, {
	versionKey: false
});


UserSchema.plugin(findOrCreate);

module.exports = mongoose.model('user', UserSchema, 'users');
