const expect = require('expect').default;
const app = require('../../../server/server');
const request = require('supertest');
const PostSchema = require('../../../server/models/post.model');
const CommentSchema = require('../../../server/models/comment.model');
const TagSchema = require('../../../server/models/tag.model');
const { seedPosts, populatePosts, seedUsers, seedComments, seedTags } = require('./seed');
const { ObjectId } = require('mongodb');
const { post } = require('../../../server/server');

// Mocha Lifecycle hook, runs before every test runs
beforeEach(populatePosts);

// We group tests based on end-points
describe('POST /posts', () => {
    it('Should create a new post', async () => {
        const body = { section: "Test2", tags: [{ title: 'Test1', slug: 'test1' }, { title: 'Test2', slug: 'test2' }] };
        const res = await request(app)
            .post('/posts')
            .set('authorization', `Bearer ${seedUsers[0].token}`)
            .send(body)
            .expect(200);
        // We also check the response
        expect(res.body.post.section).toBe(body.section);
        // Assert the post is in the database
        const posts = await PostSchema.find().populate('tags');
        expect(posts.length).toBe(seedPosts.length + 1);
        expect(posts[seedPosts.length].section).toBe(body.section);
        expect(posts[seedPosts.length].tags.length).toBe(body.tags.length);
    });
    it('Should not create a new post with invalid data', async () => {
        await request(app)
            .post('/posts')
            .set('authorization', `Bearer ${seedUsers[0].token}`)
            .send({})
            .expect(400);
        // We also check DB to see if no item was added.
        const posts = await PostSchema.find();
        expect(posts.length).toBe(seedPosts.length);
    });
    it('Should not create a post without authorization header', async () => {
        await request(app)
            .post('/posts')
            .expect(401);
    });
    it('Should not create a post unless admin', async () => {
        // First we log in with a regular user
        const res = await request(app)
            .post('/users/login')
            .send(seedUsers[2])
            .expect(200);
        await request(app)
            .post('/posts')
            .set('authorization', res.header.authorization)
            .expect(403);
    });
});

describe('GET /posts', () => {
    it('Should get all posts', async () => {
        const res = await request(app)
            .get('/posts')
            .expect(200);
        expect(res.body.posts.length).toBe(seedPosts.length);
    });
});

describe('GET /posts/:section', () => {
    const section = seedPosts[0].section;
    it('Should get all posts in section', async () => {
        const res = await request(app)
            .get(`/posts/${section}`)
            .expect(200);
        const postLength = seedPosts.filter(x => x.section === section).length;
        expect(res.body.posts.length).toBe(postLength);
    });
    it('Should return 404 if section does not exist', async () => {
        await request(app)
            .get(`/posts/ThisSectionDoesNotExist`)
            .expect(404);
    });
});

describe('GET /posts/:section/:id', () => {
    const section = seedPosts[0].section;
    it('Should return a post from a given section', async () => {
        const res = await request(app)
            .get(`/posts/${section}/${seedPosts[0]._id.toHexString()}`)
            .expect(200);
        expect(res.body.post.section).toBe(seedPosts[0].section);
    });
    it('Should return 404 if post not found', async () => {
        await request(app)
            .get(`/posts/${section}/${new ObjectId().toHexString()}`)
            .expect(404);
    });
    it('Should return 404 for invalid ID', async () => {
        await request(app)
            .get(`/posts/${section}/123`)
            .expect(404);
    });
});

describe('DELETE /posts/:section/:id', () => {
    const hexId = seedPosts[1]._id.toHexString();
    const section = seedPosts[1].section;
    it('Should not delete a post without authorization header', async () => {
        await request(app)
            .delete(`/posts/${section}/${hexId}`)
            .expect(401);
    });
    it('Should not delete a post if user is not admin', async () => {
        await request(app)
            .delete(`/posts/${section}/${hexId}`)
            .set('authorization', `Bearer ${seedUsers[2].token}`)
            .expect(403);
    });
    it('Should delete a post', async () => {
        const res = await request(app)
            .delete(`/posts/${section}/${hexId}`)
            .set('authorization', `Bearer ${seedUsers[0].token}`)
            .expect(200);
        expect(res.body.post.id).toBe(hexId);
        const post = await PostSchema.findById(hexId);
        expect(post).toBeNull();
    });
    it('Should return 404 if post to be deleted is not found', async () => {
        await request(app)
            .delete(`/posts/${section}/${new ObjectId().toHexString()}`)
            .set('authorization', `Bearer ${seedUsers[0].token}`)
            .expect(404);
    });
    it('Should return 404 if object ID of post to be deleted is invalid', async () => {
        await request(app)
            .delete(`/posts/${section}/123`)
            .set('authorization', `Bearer ${seedUsers[0].token}`)
            .expect(404);
    });
});

describe('PATCH /posts/:section/:id', () => {
    const hexId = seedPosts[1]._id.toHexString();
    const section = seedPosts[1].section;
    it('Should not update a post without an authorization header', async () => {
        await request(app)
            .patch(`/posts/${section}/${hexId}`)
            .expect(401);
    });
    it('Should not update a post if user is not admin', async () => {
        await request(app)
            .patch(`/posts/${section}/${hexId}`)
            .set('authorization', `Bearer ${seedUsers[2].token}`)
            .expect(403);
    });
    it('Should update the post', async () => {
        const section = 'TestSection';
        const res = await request(app)
            .patch(`/posts/${section}/${hexId}`)
            .set('authorization', `Bearer ${seedUsers[0].token}`)
            .send({ section })
            .expect(200);
        expect(res.body.post.section).toBe(section);
        const post = await PostSchema.findById(hexId);
        expect(post.section).toBe(section);
    });
    it('Should return 404 if post is not found while trying to update', async () => {
        await request(app)
            .patch(`/posts/${section}/${new ObjectId().toHexString()}`)
            .set('authorization', `Bearer ${seedUsers[0].token}`)
            .expect(404);
    });
    it('Should return 404 if post ID is invalid while trying to update', async () => {
        await request(app)
            .patch(`/posts/${section}/123`)
            .set('authorization', `Bearer ${seedUsers[0].token}`)
            .expect(404);
    });
});

describe('POST /posts/:section/:id/comment', () => {
    const section = seedPosts[0].section;
    const hexId = seedPosts[0]._id.toHexString();
    it('Should create a new comment on a given post', async () => {
        const name = 'Random name';
        const body = 'Random Comment';
        const res = await request(app)
            .post(`/posts/${section}/${hexId}/comment`)
            .send({ name: name, body: body, postId: seedPosts[0]._id })
            .expect(200);
        // We also check the response
        expect(res.body.comment.name).toBe(name);
        expect(res.body.comment.body).toBe(body);
        // Assert the post has the new comment
        const post = await PostSchema.findById(hexId).populate('comments');
        expect(post.comments[post.comments.length-1].name).toBe(name);
        expect(post.comments[post.comments.length-1].body).toBe(body);
        expect(post.comments[post.comments.length-1].approved).toBeFalsy();
    });
    it('Should not approve a new comment if not logged in', async () => {
        const name = 'Random Name 2';
        const body = 'Random Comment 2';
        const res = await request(app)
            .post(`/posts/${section}/${hexId}/comment`)
            .send({ name: name, body: body, postId: seedPosts[0]._id })
            .expect(200);
        const res2 = await request(app)
            .post(`/posts/${section}/${hexId}/comment/approve`)
            .send({ commentId: res.body.comment.id })
            .expect(401);
    });
    it('Should not approve a new comment if not admin', async () => {
        const name = 'Random Name 3';
        const body = 'Random Comment 3';
        const res = await request(app)
            .post(`/posts/${section}/${hexId}/comment`)
            .send({ name: name, body: body, postId: seedPosts[0]._id })
            .expect(200);
        const res2 = await request(app)
            .post(`/posts/${section}/${hexId}/comment/approve`)
            .send({ commentId: res.body.comment.id })
            .set('authorization', `Bearer ${seedUsers[2].token}`)
            .expect(403);
    });
    it('Should create a new comment and approve it if admin', async () => {
        const name = 'Random name 4';
        const body = 'Random Comment 4';
        const res = await request(app)
            .post(`/posts/${section}/${hexId}/comment`)
            .send({ name: name, body: body, postId: seedPosts[0]._id })
            .expect(200);
        const res2 = await request(app)
            .post(`/posts/${section}/${hexId}/comment/approve`)
            .send({commentId: res.body.comment.id})
            .set('authorization', `Bearer ${seedUsers[0].token}`)
            .expect(200);
        expect(res2.body.comment.approved).toBeTruthy();
        // We also check if the comment has been added to the db.
        const post = await PostSchema.findById(hexId).populate('comments');
        expect(post.comments[post.comments.length-1].name).toBe(name);
    });
    it('Should not create a new comment if body or name is invalid or empty', async () => {
        // Only spaces for string is invalid
        const name = '     ';
        // Empty string is invalid
        const body = '';
        await request(app)
            .post(`/posts/${section}/${hexId}/comment`)
            .send({ name: name, body: 'Random body' })
            .expect(400);
        // We also check DB to see if no comment was added to the post.
        let post = await PostSchema.findById(hexId).populate('comments');
        expect(post.comments.length).toBe(1);
        await request(app)
            .post(`/posts/${section}/${hexId}/comment`)
            .send({ name: 'Random Name', body: body })
            .expect(400);
        // We also check DB to see if no comment was added to the post.
        post = await PostSchema.findById(hexId).populate('comments');
        expect(post.comments.length).toBe(1);
    });
});

describe('DELETE /posts/:section/:id/comment', () => {
    const hexId = seedPosts[1]._id.toHexString();
    const section = seedPosts[1].section;
    it('Should not delete a comment without authorization header', async () => {
        const post = await PostSchema.findById(hexId).populate('comments');
        const commentId = post.comments[0]._id;
        await request(app)
            .delete(`/posts/${section}/${hexId}/comment`)
            .send(commentId)
            .expect(401);
    });
    it('Should not delete a comment if user is not admin', async () => {
        const post = await PostSchema.findById(hexId).populate('comments');
        const commentId = post.comments[0]._id;
        await request(app)
            .delete(`/posts/${section}/${hexId}/comment`)
            .set('authorization', `Bearer ${seedUsers[2].token}`)
            .send(commentId)
            .expect(403);
    });
    it('Should delete a comment', async () => {
        const post = await PostSchema.findById(hexId).populate('comments');
        const commentId = post.comments[0]._id;
        const res = await request(app)
            .delete(`/posts/${section}/${hexId}/comment`)
            .set('authorization', `Bearer ${seedUsers[0].token}`)
            .send({commentId})
            .expect(200);
        expect(res.body.comment.id).toBe(commentId.toHexString());
        const comment = await CommentSchema.findById(commentId);
        expect(comment).toBeNull();
    });
    it('Should return 404 if comment to be deleted is not found', async () => {
        await request(app)
            .delete(`/posts/${section}/${hexId}/comment`)
            .set('authorization', `Bearer ${seedUsers[0].token}`)
            .send({ commentId: new ObjectId().toHexString() })
            .expect(404);
    });
    it('Should return 404 if object ID of comment to be deleted is invalid', async () => {
        await request(app)
            .delete(`/posts/${section}/${hexId}/comment`)
            .set('authorization', `Bearer ${seedUsers[0].token}`)
            .send({ commentId: '123' })
            .expect(404);
    });
});

describe('GET /tags', async () => {
    const title = 'NewTag';
    const slug = 'newtag';
    it('Should get all tags', async () => {
        const res = await request(app)
            .get(`/tags`)
            .expect(200);
        expect(res.body.tags.length).toBe(seedTags.length);
    });
    it('Should create a new tag', async () => {
        const res = await request(app)
            .post('/tags')
            .set('authorization', `Bearer ${seedUsers[0].token}`)
            .send({ title, slug })
            .expect(200);
        // Check the response
        expect(res.body.tag.title).toBe(title);
        expect(res.body.tag.slug).toBe(slug);
        // Assert the new tag is in the db.
        const Tags = await TagSchema.find();
        expect(Tags[Tags.length-1].title).toBe(title);
        expect(Tags[Tags.length-1].slug).toBe(slug);
    });
    it('Should not create a new tag with invalid data', async () => {
        await request(app)
            .post('/tags')
            .set('authorization', `Bearer ${seedUsers[0].token}`)
            .send({})
            .expect(400);
        // We also check DB to see if no tag was added.
        const tags = await TagSchema.find({});
        expect(tags.length).toBe(seedTags.length);
    });
    it('Should not create a tag without authorization header', async () => {
        await request(app)
            .post('/tags')
            .expect(401);
    });
    it('Should not create a tag unless admin', async () => {
        // First we log in with a regular user
        const res = await request(app)
            .post('/users/login')
            .send(seedUsers[2])
            .expect(200);
        await request(app)
            .post('/tags')
            .set('authorization', res.header.authorization)
            .expect(403);
    });
});

describe('GET /tags/:tag', async () => {
    const slug = 'mathematics';
    it('Should get a specific tag', async () => {
        const res = await request(app)
            .get(`/tags/${slug}`)
            .expect(200);
        expect(res.body.tag.slug).toBe(slug);
        const tag = await TagSchema.findOne({ slug: slug }).populate('posts');
        expect(res.body.tag.posts.length).toBe(tag.posts.length);
    });
    it('Should return 404 if tag does not exist', async () => {
        await request(app)
            .get(`/tags/ThisTagDoesNotExist`)
            .expect(404);
    });
});