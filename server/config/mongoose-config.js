const mongoose = require('mongoose');
const util = require('util');
const debug = require('debug')('express-mongoose-es6-rest-api:index');

const config = require('./config');

// connect to mongo db
const mongoUri = config.mongo.host;
console.log(mongoUri);
// mongoose depracations fix: https://mongoosejs.com/docs/deprecations.html
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

console.log(config.mongo.user);
console.log(config.mongo.pass);
mongoose.connect(
	mongoUri,
	{
		useNewUrlParser: true,
		keepAlive: 1,
		user: config.mongo.user,
		pass: config.mongo.pass
	},
	function (err) {
		if (err) {
			console.error('Error! ' + err);
		} else {
			console.log('DB Connected!');
		}
	}
);

// print mongoose logs in dev env
if (config.MONGOOSE_DEBUG) {
	mongoose.set('debug', (collectionName, method, query, doc) => {
		debug(
			`${collectionName}.${method}`,
			util.inspect(query, false, 20),
			doc
		);
	});
}

module.exports.mongooseConfig = mongoose;
