// npx jest tests/admin.test.js
const mongoose = require('mongoose');
const request = require('supertest');

const { app, server } = require('../src/server');

require('dotenv').config();

let serverNew;
beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_CONNECTION_STRING);
    server.close();
    serverNew = app.listen(3002);
});

afterAll(async () => {
    await mongoose.connection.close();
    serverNew.close();
});
let session;

beforeEach(async () => {
    session = await mongoose.startSession();
    session.startTransaction();
});

afterEach(async () => {
    try {
        // Rollback transaction
        await session.abortTransaction();
    } catch (error) {
        console.error('Error during transaction rollback:', error);
    } finally {
        // Kết thúc session
        await session.endSession();
    }
});

// login funtion

describe('POST /api/admin/login', () => {
    it('should login account', async () => {
        const res = await request(app).post('/api/admin/login').send({
            username: 'admin',
            password: '123456789a',
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('user login successfull');
    });

    it('should not login account', async () => {
        const res = await request(app).post('/api/admin/login').send({
            username: 'adminabc',
            password: '123456789a',
        });
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe('Invalid username or password');
    });

    it('should not login account blocked', async () => {
        const res = await request(app).post('/api/admin/login').send({
            username: 'teachet03',
            password: '123456789a',
        });
        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe('Your account is blocked');
    });
});

// register function
describe('POST /api/admin/register', () => {
    it('should return a new user', async () => {
        const res = await request(app).post('/api/admin/register').send({
            username: 'JohnEvent',
            password: '123456789a',
            role: 3,
        });
        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe(
            'Create account oke, waiting admin approve'
        );
    });

    it('invalid username', async () => {
        const res = await request(app).post('/api/admin/register').send({
            username: 'Nguyen Van Nam',
            password: '123456789a',
            role: 2,
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Username is invalid');
    });

    it('invalid role', async () => {
        const res = await request(app).post('/api/admin/register').send({
            username: 'NguyenVanNam',
            password: '123456789a',
            role: 4,
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('role is invalid');
    });

    it('user exits, not create account', async () => {
        const res = await request(app).post('/api/admin/register').send({
            username: 'DoThanhNam',
            password: '123456789a',
            role: 2,
        });
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe(
            'username is exits. Please use another username'
        );
    });
});

// remove user fuction
const userIdActive = '6570364e4507070be66897f5';
describe('PUT /api/admin/remove-user/:userId', () => {
    it('should block account', async () => {
        const res = await request(app)
            .put(`/api/admin/remove-user/${userIdActive}`)
            .set({
                Authorization:
                    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NjBlZjRiZDUwNTViZDliOGRiMDIyNSIsInVzZXJuYW1lIjoiYWRtaW4iLCJ0aW1lU3RhbXAiOjE3MDI3MTgwMTc4MTgsImlhdCI6MTcwMjcxODAxNywiZXhwIjoxNzA1MzEwMDE3fQ.UjEJY6azXCBW1kbLV6ZkbAAie0lWgSYCWTT6c3dl62Q',
            });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('This account blocked sucessfully');
    });

    it('should not found account', async () => {
        const res = await request(app)
            .put('/api/admin/remove-user/65777e5f226fe71ee497e388')
            .set({
                Authorization:
                    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NjBlZjRiZDUwNTViZDliOGRiMDIyNSIsInVzZXJuYW1lIjoiYWRtaW4iLCJ0aW1lU3RhbXAiOjE3MDI3MTgwMTc4MTgsImlhdCI6MTcwMjcxODAxNywiZXhwIjoxNzA1MzEwMDE3fQ.UjEJY6azXCBW1kbLV6ZkbAAie0lWgSYCWTT6c3dl62Q',
            });
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('Not found user to block');
    });

    it('should Unauthorized , not admin', async () => {
        const res = await request(app)
            .put('/api/admin/remove-user/65777e5f226fe71ee497e388')
            .set({
                Authorization:
                    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NjdmMjNjYjhmN2RlYzFhZjFjYzM2YyIsInVzZXJuYW1lIjoiRG9UaGFuaE5hbSIsInRpbWVTdGFtcCI6MTcwMjc5MzI5MDQ4MCwiaWF0IjoxNzAyNzkzMjkwLCJleHAiOjE3MDUzODUyOTB9.zsWlQPu6qKhpz7hiyBVhbX2VcyiXhvwnt3tSmDRCfT0',
            });
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('You are not admin');
    });
});

// unblock account function
const userIdBlocked = userIdActive;
describe('PUT /api/admin/unblock-user/:userId', () => {
    it('should unblock account', async () => {
        const res = await request(app)
            .put(`/api/admin/unblock-user/${userIdBlocked}`)
            .set({
                Authorization:
                    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NjBlZjRiZDUwNTViZDliOGRiMDIyNSIsInVzZXJuYW1lIjoiYWRtaW4iLCJ0aW1lU3RhbXAiOjE3MDI3OTM2OTAwNzUsImlhdCI6MTcwMjc5MzY5MCwiZXhwIjoxNzA1Mzg1NjkwfQ.m0N8rKj_VJWMnTyjodwTDfs1sIZvwq0GITMzLm0HIZA',
            });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Account has active');
    });

    it('should not found account', async () => {
        const res = await request(app)
            .put('/api/admin/unblock-user/6570364e4507070be66897f6')
            .set({
                Authorization:
                    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NjBlZjRiZDUwNTViZDliOGRiMDIyNSIsInVzZXJuYW1lIjoiYWRtaW4iLCJ0aW1lU3RhbXAiOjE3MDI3OTM2OTAwNzUsImlhdCI6MTcwMjc5MzY5MCwiZXhwIjoxNzA1Mzg1NjkwfQ.m0N8rKj_VJWMnTyjodwTDfs1sIZvwq0GITMzLm0HIZA',
            });
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('Not found user');
    });

    it('should return fail, status account is active', async () => {
        const res = await request(app)
            .put('/api/admin/unblock-user/6567f23cb8f7dec1af1cc36c')
            .set({
                Authorization:
                    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NjBlZjRiZDUwNTViZDliOGRiMDIyNSIsInVzZXJuYW1lIjoiYWRtaW4iLCJ0aW1lU3RhbXAiOjE3MDI3OTM2OTAwNzUsImlhdCI6MTcwMjc5MzY5MCwiZXhwIjoxNzA1Mzg1NjkwfQ.m0N8rKj_VJWMnTyjodwTDfs1sIZvwq0GITMzLm0HIZA',
            });
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe('The account is not block');
    });

    it('should Unauthorized , not admin', async () => {
        const res = await request(app)
            .put('/api/admin/unblock-user/6577d6dcc423b7f82443a26d')
            .set({
                Authorization:
                    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NjdmMjNjYjhmN2RlYzFhZjFjYzM2YyIsInVzZXJuYW1lIjoiRG9UaGFuaE5hbSIsInRpbWVTdGFtcCI6MTcwMjc5MzI5MDQ4MCwiaWF0IjoxNzAyNzkzMjkwLCJleHAiOjE3MDUzODUyOTB9.zsWlQPu6qKhpz7hiyBVhbX2VcyiXhvwnt3tSmDRCfT0',
            });
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('You are not admin');
    });
});

// get all user is a teacher

describe('GET /api/admin/all-teacher', () => {
    it('should return list teacher account', async () => {
        const res = await request(app).get('/api/admin/all-teacher').set({
            Authorization:
                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NjBlZjRiZDUwNTViZDliOGRiMDIyNSIsInVzZXJuYW1lIjoiYWRtaW4iLCJ0aW1lU3RhbXAiOjE3MDI3OTM2OTAwNzUsImlhdCI6MTcwMjc5MzY5MCwiZXhwIjoxNzA1Mzg1NjkwfQ.m0N8rKj_VJWMnTyjodwTDfs1sIZvwq0GITMzLm0HIZA',
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Get list teachers successfull');
    });

    it('should Unauthorized , not admin', async () => {
        const res = await request(app).get('/api/admin/all-teacher').set({
            Authorization:
                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NjdmMjNjYjhmN2RlYzFhZjFjYzM2YyIsInVzZXJuYW1lIjoiRG9UaGFuaE5hbSIsInRpbWVTdGFtcCI6MTcwMjc5MzI5MDQ4MCwiaWF0IjoxNzAyNzkzMjkwLCJleHAiOjE3MDUzODUyOTB9.zsWlQPu6qKhpz7hiyBVhbX2VcyiXhvwnt3tSmDRCfT0',
        });
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('You are not admin');
    });
});

// get all user is a student

describe('GET /api/admin/all-student', () => {
    it('should return list teacher account', async () => {
        const res = await request(app).get('/api/admin/all-student').set({
            Authorization:
                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NjBlZjRiZDUwNTViZDliOGRiMDIyNSIsInVzZXJuYW1lIjoiYWRtaW4iLCJ0aW1lU3RhbXAiOjE3MDI3OTM2OTAwNzUsImlhdCI6MTcwMjc5MzY5MCwiZXhwIjoxNzA1Mzg1NjkwfQ.m0N8rKj_VJWMnTyjodwTDfs1sIZvwq0GITMzLm0HIZA',
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Get list students successfull');
    });

    it('should Unauthorized , not admin', async () => {
        const res = await request(app).get('/api/admin/all-student').set({
            Authorization:
                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NjdmMjNjYjhmN2RlYzFhZjFjYzM2YyIsInVzZXJuYW1lIjoiRG9UaGFuaE5hbSIsInRpbWVTdGFtcCI6MTcwMjc5MzI5MDQ4MCwiaWF0IjoxNzAyNzkzMjkwLCJleHAiOjE3MDUzODUyOTB9.zsWlQPu6qKhpz7hiyBVhbX2VcyiXhvwnt3tSmDRCfT0',
        });
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('You are not admin');
    });
});
