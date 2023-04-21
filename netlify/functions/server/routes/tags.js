const express = require('express');
const serverless = require('serverless-http');
const TagController = require('../controllers/tags');
const authenticate = require('../middleware/auth');
const admin = require('../middleware/admin');
const app = express();

app.get('/tags', TagController.getTagList);
app.post('/tags', authenticate, admin, TagController.createTag);
app.post('/tags/removeOprhans', authenticate, admin, TagController.removeOprhans);
app.get('/tags/:tag', TagController.getTag);

module.exports.handler = serverless(app);