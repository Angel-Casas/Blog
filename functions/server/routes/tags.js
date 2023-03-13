const express = require('express');
const router = express.Router();
const TagController = require('../controllers/tags');
const authenticate = require('../middleware/auth');
const admin = require('../middleware/admin');

router
    .route('/')
    .get(TagController.getTagList)
    .all(authenticate, admin)
    .post(TagController.createTag);

router
    .route('/removeOrphans')
    .all(authenticate, admin)
    .post(TagController.removeOrphans);

router
    .route('/:tag')
    .get(TagController.getTag);


module.exports = router;