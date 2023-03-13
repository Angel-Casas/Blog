const expect = require('expect').default;
const app = require('../../../server/server');
const request = require('supertest');
const UserSchema = require('../../../server/models/user.model');
const { seedUsers, populateUsers } = require('./seed');
const { faker } = require('@faker-js/faker');

beforeEach(populateUsers);

describe('GET /users', () => {
    it('Should return user if authenticated', async () => {
        const res = await request(app)
            .get('/users')
            .set('authorization', `Bearer ${seedUsers[0].token}`)
            .expect(200);
        expect(res.body.user._id).toBe(seedUsers[0]._id.toHexString());
    });
    it('Should return 401 if unauthenticated', async () => {
        const res = await request(app)
            .get('/users')
            .expect(401);
        expect(res.body.user).toBeUndefined();
    });
});

describe('POST /users', () => {
    it('Should create a user', async () => {
        const user = {
            name: faker.name.firstName(),
            email: faker.internet.email(),
            password: faker.internet.password()
        };
        const res = await request(app)
            .post('/users/register')
            .send(user)
            .expect(200);
        // Assert there is an authorization header.
        expect(res.header.authorization).toBeDefined();
        // We check at least one property of the result.
        expect(res.body.user.email).toBe(user.email);
        const doc = await UserSchema.findOne({ email: user.email });
        // Simply match for truthy since mongo returns false if not found.
        expect(doc).toBeTruthy();
        // Simple way to know if a password hashing is not being aplied.
        expect(doc.password).not.toBe(user.password);
    });
    it('Should not create a user with invalid data', async () => {
        // By sending an empty object validation triggers and sends error 400.
        await request(app)
            .post('/users/register')
            .send({})
            .expect(400);
        const users = await UserSchema.find();
        // Only the two seed users should be on the DB since it failed.
        expect(users.length).toBe(seedUsers.length);
    });
    it('Should not create a new user with duplicate email', async () => {
        await request(app)
            .post('/users/register')
            .send(seedUsers[0])
            .expect(400);
        const users = await UserSchema.find();
        expect(users.length).toBe(seedUsers.length);
    });
});

describe('POST /users/login', () => {
    it('Should log in user and return auth token', async () => {
        const { _id, email, password } = seedUsers[1];
        const res = await request(app)
            .post('/users/login')
            .send({ email, password })
            .expect(200);
        expect(res.header.authorization).toBeTruthy();
        const user = await UserSchema.findById(_id);
        expect(user.token).toBe(res.headers.authorization.split(' ')[1]);
    });
    it('Should reject invalid login', async () => {
        const { _id, email, password } = seedUsers[1];
        const res = await request(app)
            .post('/users/login')
            .send({ email, password: password + '0' })
            .expect(400);
        expect(res.header.authorization).toBeFalsy();
        const user = await UserSchema.findById(_id);
        expect(user.token).toBeUndefined();
    });
});

describe('GET /users/logout', () => {
    it('Should remove auth token on logout', async () => {
        const res = await request(app)
            .get('/users/logout')
            .set('authorization', `Bearer ${seedUsers[2].token}`)
            .expect(200);
        expect(res.headers.authorization).toBeFalsy();
        const user = await UserSchema.findById(seedUsers[2]._id);
        expect(user.token).toBeNull();
    });
});