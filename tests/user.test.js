// npx jest tests/user.test.js
const mongoose = require('mongoose');
const request = require('supertest');

const { app, server } = require('../src/server');

require('dotenv').config();

let serverNew;
beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_CONNECTION_STRING);
    server.close();
    serverNew = app.listen(3004);
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

describe('GET /api/user/get-user-detail', () => {
    it('should return user detail and 200 status if user exists', async () => {
        const response = await request(app)
            .get('/api/user/get-user-detail')
            .set({
                Authorization:
                    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NjBlZjRiZDUwNTViZDliOGRiMDIyNSIsInVzZXJuYW1lIjoiYWRtaW4iLCJ0aW1lU3RhbXAiOjE3MDI3OTM2OTAwNzUsImlhdCI6MTcwMjc5MzY5MCwiZXhwIjoxNzA1Mzg1NjkwfQ.m0N8rKj_VJWMnTyjodwTDfs1sIZvwq0GITMzLm0HIZA',
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Get user detail success');
    });

    it('should return Unauthorized', async () => {
        const res = await request(app).post('/api/admin/subject/History');
        expect(res.statusCode).toBe(401);
    });
});

describe('GET /api/user/get-all-test', () => {
    it('should return tests and 200 status if tests exist', async () => {
        const response = await request(app).get('/api/user/get-all-test').set({
            Authorization:
                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NjBlZjRiZDUwNTViZDliOGRiMDIyNSIsInVzZXJuYW1lIjoiYWRtaW4iLCJ0aW1lU3RhbXAiOjE3MDI3OTM2OTAwNzUsImlhdCI6MTcwMjc5MzY5MCwiZXhwIjoxNzA1Mzg1NjkwfQ.m0N8rKj_VJWMnTyjodwTDfs1sIZvwq0GITMzLm0HIZA',
        });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Get data oke');
    });

    it('should return Unauthorized', async () => {
        const res = await request(app).get('/api/user/get-all-test');
        expect(res.statusCode).toBe(401);
    });

    it('should return status 401, with you are student', async () => {
        const res = await request(app).get(`/api/user/get-all-test`).set({
            Authorization:
                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NzAzNjRlNDUwNzA3MGJlNjY4OTdmNSIsInVzZXJuYW1lIjoic3R1ZGVudDIiLCJ0aW1lU3RhbXAiOjE3MDI4ODY1NjM0MTcsImlhdCI6MTcwMjg4NjU2MywiZXhwIjoxNzA1NDc4NTYzfQ.kXmMq5Qf_qk38GNEbL3jfKUmzN0we2BiEBVN1ODFmMo',
        });
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('You are student, not allow to access');
    });
});

const testId = '656d492d5b6da18c7374c555';
describe('GET /api/user/get-test-detail/:testId', () => {
    it('should return test detail and 200 status if test exists', async () => {
        const response = await request(app)
            .get(`/api/user/get-test-detail/${testId}`)
            .set({
                Authorization:
                    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NjBlZjRiZDUwNTViZDliOGRiMDIyNSIsInVzZXJuYW1lIjoiYWRtaW4iLCJ0aW1lU3RhbXAiOjE3MDI3OTM2OTAwNzUsImlhdCI6MTcwMjc5MzY5MCwiZXhwIjoxNzA1Mzg1NjkwfQ.m0N8rKj_VJWMnTyjodwTDfs1sIZvwq0GITMzLm0HIZA',
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Get data oke');
    });

    it('should return 404 status if no test is found', async () => {
        const response = await request(app)
            .get(`/api/user/get-test-detail/656d492d5b6da18c7374c556`)
            .set({
                Authorization:
                    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NjBlZjRiZDUwNTViZDliOGRiMDIyNSIsInVzZXJuYW1lIjoiYWRtaW4iLCJ0aW1lU3RhbXAiOjE3MDI3OTM2OTAwNzUsImlhdCI6MTcwMjc5MzY5MCwiZXhwIjoxNzA1Mzg1NjkwfQ.m0N8rKj_VJWMnTyjodwTDfs1sIZvwq0GITMzLm0HIZA',
            });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe(
            'Not found test with this testId in database'
        );
    });

    it('should return Unauthorized', async () => {
        const res = await request(app).get(
            `/api/user/get-test-detail/${testId}`
        );
        expect(res.statusCode).toBe(401);
    });

    it('should return status 401, with you are student', async () => {
        const res = await request(app)
            .get(`/api/user/get-test-detail/${testId}`)
            .set({
                Authorization:
                    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NzAzNjRlNDUwNzA3MGJlNjY4OTdmNSIsInVzZXJuYW1lIjoic3R1ZGVudDIiLCJ0aW1lU3RhbXAiOjE3MDI4ODY1NjM0MTcsImlhdCI6MTcwMjg4NjU2MywiZXhwIjoxNzA1NDc4NTYzfQ.kXmMq5Qf_qk38GNEbL3jfKUmzN0we2BiEBVN1ODFmMo',
            });
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('You are student, not allow to access');
    });
});
