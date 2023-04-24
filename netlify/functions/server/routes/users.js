const express = require('express');
const serverless = require('serverless-http');
const UserController = require('../controllers/users');
const authenticate = require('../middleware/auth');
const app = express();

app.get('/users', authenticate, UserController.read);
app.post('/users/login', UserController.login);
app.post('/users/regisster', UserController.register);
app.get('/users/logout', authenticate, UserController.logout);

module.exports = serverless(app);