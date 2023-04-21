const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./models');
const path = require('path');
const serverless = require('serverless-http');

const app = express();

require("dotenv").config({
    path: path.join(__dirname, "../../../environment/.env")
});

var corsOptions = {
    origin: `http://localhost:${process.env.VITE_SERVER_PORT}`
};

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

// Cross-Origin Resource Sharing.
app.use(cors(corsOptions));

// Parse requests of content-type - application/json
app.use(bodyParser.json({ limit: '50mb' }));

// Parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Register routes
app.use('/.netlify/functions/server/posts', require('./routes/posts'));
app.use('/.netlify/functions/server/users', require('./routes/users'));
app.use('/.netlify/functions/server/tags', require('./routes/tags'));

// Set port, listen for requests
const PORT = process.env.SERVER_PORT || 8070;

if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

module.exports = app;
module.exports.handler = serverless(app);