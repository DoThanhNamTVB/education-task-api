// npx jest tests/student.test.js

const { tokenStudent } = require('./token');
const mongoose = require('mongoose');
const request = require('supertest');

const { app, server } = require('../src/server');
const Test = require('../src/model/Test');

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

describe('POST /api/user/register-into-test/:testId', () => {
    it('should register a student for a test and return 201 status if testId is valid', async () => {
        const response = await request(app)
            .post(`/api/user/register-into-test/65805a14a454112050602f98`)
            .set('Authorization', tokenStudent);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Register test success');
    });

    it('should return 404 status if testId is not found', async () => {
        const response = await request(app)
            .post('/api/user/register-into-test/65805a2c18a31720de3261a3')
            .set('Authorization', tokenStudent);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Not found test');
    });

    it('should return 400 status if test status is not valid for registration', async () => {
        const existingTest = {
            _id: '65805a2c18a31720de3261a4',
            testName: 'Math Test',
            status: 'Completed',
            student: [],
        };

        // Mock Test.findById to return the existing test
        Test.findById = jest.fn().mockResolvedValueOnce(existingTest);

        const response = await request(app)
            .post(`/api/user/register-into-test/${existingTest._id}`)
            .set('Authorization', tokenStudent);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe(
            `Not allow to register test with status test now: ${existingTest.status}`
        );
    });
});

describe('GET /api/user/get-all-test-student', () => {
    it('should get all tests for a student and return 200 status', async () => {
        const response = await request(app)
            .get('/api/user/get-all-test-student')
            .set('Authorization', tokenStudent);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Get all test student successfull');
    });
});

describe('GET /api/user/get-up-coming-test', () => {
    it('should get upcoming tests for a student and return 200 status', async () => {
        const response = await request(app)
            .get('/api/user/get-up-coming-test')
            .set('Authorization', tokenStudent);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Get upcoming test successful');
    });
});

describe('PUT /api/user/start-test/:testId', () => {
    it('should start a test for a student and return 200 status', async () => {
        const response = await request(app)
            .put('/api/user/start-test/656d42b2b525cf99e4739a3b')
            .set('Authorization', tokenStudent);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Create a test success');
    });

    it('should return 500 status if the test has already been started', async () => {
        const response = await request(app)
            .put('/api/user/start-test/656d42b2b525cf99e4739a3b')
            .set('Authorization', tokenStudent);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('test was started');
    });

    it('should return 404 status if the test does not exist', async () => {
        const response = await request(app)
            .put('/api/user/start-test/656d42b2b525cf99e4739a3e')
            .set('Authorization', tokenStudent);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Test is not exist');
    });

    it('should return 500 status if the test is not active', async () => {
        const response = await request(app)
            .put('/api/user/start-test/656d492d5b6da18c7374c555')
            .set('Authorization', tokenStudent);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe(
            'Test is not already with status test now'
        );
    });

    it('should return 404 status if the student is not in the test list', async () => {
        const response = await request(app)
            .put('/api/user/start-test/656d492d5b6da18c7374c555')
            .set('Authorization', tokenStudent);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe(
            'Not found you in test list, please register in test'
        );
    });
});

describe('PUT /api/user/to-result-test', () => {
    it('should calculate and update test result for a student and return 200 status', async () => {
        const testId = '656d42b2b525cf99e4739a3b';
        const listAnswer = [
            {
                questionId: '656d06c34d7773c84a14763e',
                selectedAnswer: '656d06c34d7773c84a14763f',
            },
            {
                questionId: '656cff5bcf286311cc7b0a79',
                selectedAnswer: '65802cf0f2f2094fc4d0243b',
            },
            {
                questionId: '656d01ce0c68a463d540703c',
                selectedAnswer: '656d01ce0c68a463d540703e',
            },
            {
                questionId: '656d0506110672d426359729',
                selectedAnswer: '656d2566615bb4b63ec116cc',
            },
        ];
        const response = await request(app)
            .put('/api/user/to-result-test')
            .send({
                testId: testId,
                listAnswer: listAnswer,
            })
            .set('Authorization', tokenStudent);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Calcular result oke');
    });
});

describe('GET /api/user/get-all-complete-test', () => {
    it('should get all completed tests for a student', async () => {
        const response = await request(app)
            .get('/api/user/get-all-complete-test')
            .set('Authorization', tokenStudent);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Get completed test success');
    });
});

describe('GET /api/user/get-result-test/:testId', () => {
    it('should get the result of a completed test for a student', async () => {
        const response = await request(app)
            .get(`/api/user/get-result-test/656d42b2b525cf99e4739a3b`)
            .set('Authorization', tokenStudent);

        expect(response.status).toBe(200);
    });

    it('should handle the case where you have not taken', async () => {
        const response = await request(app)
            .get(`/api/user/get-result-test/65805a14a454112050602f98`)
            .set('Authorization', tokenStudent);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('You have not taken this test yet');
    });

    it('should handle the case where the test is not found', async () => {
        const response = await request(app)
            .get(`/api/user/get-result-test/65805a14a454112050602f92`)
            .set('Authorization', tokenStudent);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Not found test');
    });
});
