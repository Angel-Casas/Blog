const dbConfig = require('../config/db.config.js');

const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;
db.url = dbConfig.url;
db.options = dbConfig.mongoOptions;
db.posts = require('./post.model.js')(mongoose);
db.tags = require('./tag.model.js')(mongoose);
db.users = require('./user.model.js')(mongoose);

module.exports = db;