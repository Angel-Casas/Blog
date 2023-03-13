const express = require('express');
const router = express.Router();
const PostController = require('../controllers/posts');
const authenticate = require('../middleware/auth');
const admin = require('../middleware/admin');

router
    .route('/')
    .get(PostController.list)
    .all(authenticate, admin)
    .post(PostController.create);

router
    .route('/:section')
    .get(PostController.readSection);

router
    .route('/:section/:id')
    .get(PostController.read)
    .all(authenticate, admin)
    .delete(PostController.delete)
    .patch(PostController.update);

router
    .route('/:section/:id/comment')
    .post(PostController.createCommentOnPost)
    .all(authenticate, admin)
    .delete(PostController.deleteCommentOnPost);

router
    .route('/:section/:id/comment/approve')
    .all(authenticate, admin)
    .post(PostController.approveComment);

module.exports = router;