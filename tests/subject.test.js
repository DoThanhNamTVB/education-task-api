// npx jest tests/subject.test.js
const mongoose = require('mongoose');
const request = require('supertest');

const { app, server } = require('../src/server');

require('dotenv').config();
let serverNew;
/* Connecting to the database before each test. */
beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_CONNECTION_STRING);
    server.close();
    serverNew = app.listen(3003);
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

// create a subject

describe('POST /api/admin/subject/:subjectName', () => {
    it('should create a new subject', async () => {
        const res = await request(app)
            .post('/api/admin/subject/testSubject')
            .set({
                Authorization:
                    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NjBlZjRiZDUwNTViZDliOGRiMDIyNSIsInVzZXJuYW1lIjoiYWRtaW4iLCJ0aW1lU3RhbXAiOjE3MDI3OTM2OTAwNzUsImlhdCI6MTcwMjc5MzY5MCwiZXhwIjoxNzA1Mzg1NjkwfQ.m0N8rKj_VJWMnTyjodwTDfs1sIZvwq0GITMzLm0HIZA',
            });
        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe('Subject is created');
    });

    it('should Unauthorized , not admin', async () => {
        const res = await request(app).post('/api/admin/subject/History').set({
            Authorization:
                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NjdmMjNjYjhmN2RlYzFhZjFjYzM2YyIsInVzZXJuYW1lIjoiRG9UaGFuaE5hbSIsInRpbWVTdGFtcCI6MTcwMjc5MzI5MDQ4MCwiaWF0IjoxNzAyNzkzMjkwLCJleHAiOjE3MDUzODUyOTB9.zsWlQPu6qKhpz7hiyBVhbX2VcyiXhvwnt3tSmDRCfT0',
        });
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('You are not admin');
    });
});

// removeSubject
const subjectCodeDelete = 'ab401d81-0061-40c7-895f-c957f5565662';

describe('DELETE /api/admin/subject/:subjectCode', () => {
    it('should delete subject', async () => {
        const res = await request(app)
            .delete(`/api/admin/subject/${subjectCodeDelete}`)
            .set({
                Authorization:
                    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NjBlZjRiZDUwNTViZDliOGRiMDIyNSIsInVzZXJuYW1lIjoiYWRtaW4iLCJ0aW1lU3RhbXAiOjE3MDI3OTM2OTAwNzUsImlhdCI6MTcwMjc5MzY5MCwiZXhwIjoxNzA1Mzg1NjkwfQ.m0N8rKj_VJWMnTyjodwTDfs1sIZvwq0GITMzLm0HIZA',
            });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Subject deleted');
    });

    it('not found with subjectcode', async () => {
        const res = await request(app)
            .delete('/api/admin/subject/870dc6d7-c695-4d04-ac2d-9f450d2e2122')
            .set({
                Authorization:
                    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NjBlZjRiZDUwNTViZDliOGRiMDIyNSIsInVzZXJuYW1lIjoiYWRtaW4iLCJ0aW1lU3RhbXAiOjE3MDI3OTM2OTAwNzUsImlhdCI6MTcwMjc5MzY5MCwiZXhwIjoxNzA1Mzg1NjkwfQ.m0N8rKj_VJWMnTyjodwTDfs1sIZvwq0GITMzLm0HIZA',
            });
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('Subject not found in database');
    });

    it('should Unauthorized , not admin', async () => {
        const res = await request(app)
            .delete(`/api/admin/subject/481961bb-ed23-462e-9b87-69990ca98e1c`)
            .set({
                Authorization:
                    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NjdmMjNjYjhmN2RlYzFhZjFjYzM2YyIsInVzZXJuYW1lIjoiRG9UaGFuaE5hbSIsInRpbWVTdGFtcCI6MTcwMjc5MzI5MDQ4MCwiaWF0IjoxNzAyNzkzMjkwLCJleHAiOjE3MDUzODUyOTB9.zsWlQPu6qKhpz7hiyBVhbX2VcyiXhvwnt3tSmDRCfT0',
            });
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('You are not admin');
    });
});

// get all subject
describe('GET /api/admin/subject', () => {
    it('should return list subject', async () => {
        const res = await request(app).get('/api/admin/subject').set({
            Authorization:
                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NjBlZjRiZDUwNTViZDliOGRiMDIyNSIsInVzZXJuYW1lIjoiYWRtaW4iLCJ0aW1lU3RhbXAiOjE3MDI3OTM2OTAwNzUsImlhdCI6MTcwMjc5MzY5MCwiZXhwIjoxNzA1Mzg1NjkwfQ.m0N8rKj_VJWMnTyjodwTDfs1sIZvwq0GITMzLm0HIZA',
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Get all list subject successful');
    });

    it('should Unauthorized , not admin', async () => {
        const res = await request(app).get('/api/admin/subject').set({
            Authorization:
                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NjdmMjNjYjhmN2RlYzFhZjFjYzM2YyIsInVzZXJuYW1lIjoiRG9UaGFuaE5hbSIsInRpbWVTdGFtcCI6MTcwMjc5MzI5MDQ4MCwiaWF0IjoxNzAyNzkzMjkwLCJleHAiOjE3MDUzODUyOTB9.zsWlQPu6qKhpz7hiyBVhbX2VcyiXhvwnt3tSmDRCfT0',
        });
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('You are not admin');
    });
});
