const express = require('express');
const db = require('./models');

const app = express();

// Mongoose connection
db.mongoose
    .connect(db.url, db.mongoOptions)
    .then(() => {
        // Success
        console.log('Successfully connected to Mongo database.');
    })
    .catch((err) => {
        console.error('Something went wrong.', err);
        process.exit();
    });

// Parse requests of content-type - application/json
app.use(express.json({ limit: '50mb' }));

// Parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Register routes
app.use('/.netlify/functions/server/posts', require('./routes/posts'));
app.use('/.netlify/functions/server/users', require('./routes/users'));
app.use('/.netlify/functions/server/tags', require('./routes/tags'));

module.exports = app;