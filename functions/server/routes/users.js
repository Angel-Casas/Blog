const express = require('express');
const router = express.Router();
const UserController = require('../controllers/users');
const authenticate = require('../middleware/auth');

router
    .route('/')
    .all(authenticate)
    .get(UserController.read);

router
    .route('/login')
    .post(UserController.login);

router
    .route('/register')
    .post(UserController.register);

router
    .route('/logout')
    .all(authenticate)
    .get(UserController.logout);

module.exports = router;