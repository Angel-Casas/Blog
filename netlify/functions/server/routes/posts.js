const express = require('express');
const serverless = require('serverless-http');
const PostController = require('../controllers/posts');
const authenticate = require('../middleware/auth');
const admin = require('../middleware/admin');
const app = express();

app.get('/posts', PostController.list);
app.post('/posts', authenticate, admin, PostController.create);
app.get('/posts/:section', PostController.readSection);
app.get('/posts/:section/:id', PostController.read);
app.patch('/posts/:section/:id', authenticate, admin, PostController.update);
app.delete('/posts/:section/:id', authenticate, admin, PostController.delete);
app.post('/posts/:section/:id/comment', PostController.createCommentOnPost);
app.delete('/posts/:section/:id/comment', authenticate, admin, PostController.deleteCommentOnPost);
app.post('/posts/:section/:id/comment/approve', authenticate, admin, PostController.approveComment);

module.exports.handler = serverless(app);