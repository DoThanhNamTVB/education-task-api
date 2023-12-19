// npx jest tests/teacher.test.js
const { tokenTeacher, tokenStudent } = require('./token');
const mongoose = require('mongoose');
const request = require('supertest');

const { app, server } = require('../src/server');
const Question = require('../src/model/Question');
const Subject = require('../src/model/Subject');

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

describe('POST /api/user/add-question-subject', () => {
    it('should add a question and return 201 status if all data is valid', async () => {
        const validRequest = {
            subjectId: '657fda5d2930dc522a482f51',
            questionName: 'What is 2 + 2?',
            answer: [
                { content: '4', isTrue: true },
                { content: '5', isTrue: false },
                { content: '6', isTrue: false },
                { content: '7', isTrue: false },
            ],
            status: 'active',
        };

        const response = await request(app)
            .post('/api/user/add-question-subject')
            .send(validRequest)
            .set({ Authorization: tokenTeacher });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('add question is oke');
    });

    it('should return 404 status if subject is not found', async () => {
        const invalidRequest = {
            subjectId: '657fda5d2930dc522a482f50',
            questionName: 'What is 2 + 2?',
            answer: [
                { content: '4', isTrue: true },
                { content: '5', isTrue: false },
            ],
            status: 'active',
        };

        const response = await request(app)
            .post('/api/user/add-question-subject')
            .send(invalidRequest)
            .set({ Authorization: tokenTeacher });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe(
            'Not found subject with this subjectid'
        );
    });
});

describe('GET /api/user/search-question', () => {
    it('should return questions and 200 status if questions are found', async () => {
        const response = await request(app)
            .get('/api/user/search-question')
            .query({ questionName: '2 x 5' })
            .set('Authorization', tokenTeacher);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(
            'Get question by search successfull'
        );
    });
});

describe('PUT /api/user/question-action/:questionId', () => {
    it('should update a question and return 200 status if all data is valid', async () => {
        const updatedData = {
            subjectId: '657fdbb641da84ff7d9847d1',
            questionName: 'What is 3 + 3?',
            answer: [{ content: '6', isTrue: true }],
            status: 'inactive',
        };

        const response = await request(app)
            .put(`/api/user/question-action/656cff5bcf286311cc7b0a79`)
            .send(updatedData)
            .set('Authorization', tokenTeacher);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('update question oke');
    });

    it('should return 404 status if questionId is not found', async () => {
        const updatedData = {
            subjectId: '657fdbb641da84ff7d9847d1',
            questionName: 'What is 3 + 3?',
            answer: [{ content: '6', isTrue: true }],
            status: 'inactive',
        };

        const response = await request(app)
            .put('/api/user/question-action/65800f26bfcebf90992bc03e')
            .send(updatedData)
            .set('Authorization', tokenTeacher);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Not found question in database');
    });

    it('should return 404 status if subjetId is not found', async () => {
        const updatedData = {
            subjectId: '657fda5d2930dc522a482f53',
            questionName: 'What is 3 + 3?',
            answer: [{ content: '6', isTrue: true }],
            status: 'inactive',
        };

        const response = await request(app)
            .put('/api/user/question-action/656cff5bcf286311cc7b0a79')
            .send(updatedData)
            .set('Authorization', tokenTeacher);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Not found subject');
    });

    it('should return 400 status if answer is not correct format', async () => {
        const updatedData = {
            subjectId: '657fda5d2930dc522a482f51',
            questionName: 'What is 3 + 3?',
            answer: [{ isTrue: true }],
            status: 'inactive',
        };

        const response = await request(app)
            .put('/api/user/question-action/656cff5bcf286311cc7b0a79')
            .send(updatedData)
            .set('Authorization', tokenTeacher);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('data answer is not correct format');
    });
});
questionIdDelete =
    describe('DELETE /api/user/question-action/:questionId', () => {
        it('should delete a question and return 200 status if questionId is valid', async () => {
            const existingQuestion = {
                _id: '65800f26bfcebf90992bc032',
                questionName: 'What is 2 + 2?',
                answer: [{ content: '4', isTrue: true }],
                status: 'active',
            };

            // Mock Question.findByIdAndDelete to return the deleted question
            Question.findByIdAndDelete = jest
                .fn()
                .mockResolvedValueOnce(existingQuestion);

            const response = await request(app)
                .delete(`/api/user/question-action/${existingQuestion._id}`)
                .set('Authorization', tokenTeacher);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('delete question oke');
        });

        it('should return 404 status if no question is found', async () => {
            const response = await request(app)
                .delete('/api/user/question-action/65800f26bfcebf90992bc03e')
                .set('Authorization', tokenTeacher);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('No this question in database');
        });
    });

describe('PUT /api/user/change-status-question', () => {
    it('should update the status of a question and return 200 status if questionId and status are valid', async () => {
        const existingQuestion = {
            _id: '65800f26bfcebf90992bc03e',
            questionName: 'What is 2 + 2?',
            answer: [{ content: '4', isTrue: true }],
            status: 'active',
        };
        // Mock Question.findById to return the existing question
        Question.findByIdAndUpdate = jest
            .fn()
            .mockResolvedValueOnce(existingQuestion);
        const updatedStatus = 'inactive';
        const response = await request(app)
            .put('/api/user/change-status-question')
            .send({ questionId: existingQuestion._id, status: updatedStatus })
            .set('Authorization', tokenTeacher);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('update status is oke');
    });

    it('should return 400 status if questionId or status is missing', async () => {
        const response = await request(app)
            .put('/api/user/change-status-question')
            .send({ questionId: '65800f26bfcebf90992bc03d' })
            .set('Authorization', tokenTeacher);
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('questionId, status is require');
    });

    it('should return 400 status if status is invalid', async () => {
        const response = await request(app)
            .put('/api/user/change-status-question')
            .send({
                questionId: '65800f26bfcebf90992bc03d',
                status: 'oke',
            })
            .set('Authorization', tokenTeacher);
        expect(response.status).toBe(400);
        expect(response.body.message).toBe(
            "status is invalid, it maybe 'active', 'inactive', 'draft'"
        );
    });

    it('should return 400 status if question is not found', async () => {
        const response = await request(app)
            .put('/api/user/change-status-question')
            .send({
                questionId: '65800f26bfcebf90992bc03e',
                status: 'inactive',
            })
            .set('Authorization', tokenTeacher);
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Not found question with this id');
    });
});

describe('POST /api/user/create-test', () => {
    it('should create a test and return 201 status if all data is valid', async () => {
        // Mock Subject.findById to return a subject
        Subject.findById = jest.fn().mockResolvedValueOnce({
            _id: '657fda5d2930dc522a482f51',
            name: 'Math',
        });
        // Mock Question.find to return an array of question IDs
        Question.find = jest
            .fn()
            .mockResolvedValueOnce([
                { _id: '6567f23cb8f7dec1af1cc36c' },
                { _id: '656a671ca8e224f2948936b8' },
            ]);
        const testData = {
            testName: 'Math Test 2',
            subjectId: '657fda5d2930dc522a482f52',
            startTime: '2023-12-03T22:52:51.987Z',
            endTime: '2023-12-06T22:52:51.987Z',
            duringStart: 60,
            question: [
                { questionId: '6567f23cb8f7dec1af1cc36c' },
                { questionId: '6567f23cb8f7dec1af1cc36c' },
            ],
        };
        const response = await request(app)
            .post('/api/user/create-test')
            .send(testData)
            .set('Authorization', tokenTeacher);
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('create test oke');
    });

    it('should return 400 status if data is missing', async () => {
        const response = await request(app)
            .post('/api/user/create-test')
            .send({ testName: 'Math Test' })
            .set('Authorization', tokenTeacher);
        expect(response.status).toBe(400);
        expect(response.body.message).toBe(
            'Data is require : testName, subjectId, auth, duringStart, question '
        );
    });

    it('should return 404 status if subjectId is not found', async () => {
        const response = await request(app)
            .post('/api/user/create-test')
            .send({
                testName: 'Math Test',
                subjectId: '657fda5d2930dc522a482f52',
                duringStart: 60,
                question: [{ questionId: '656cff5bcf286311cc7b0a79' }],
            })
            .set('Authorization', tokenTeacher);
        expect(response.status).toBe(404);
        expect(response.body.message).toBe(
            'Not found subject with this subjectId'
        );
    });

    it('should return 404 status if questionId in question array is not found', async () => {
        const response = await request(app)
            .post('/api/user/create-test')
            .send({
                testName: 'Math Test',
                subjectId: '657fda5d2930dc522a482f51',
                duringStart: 60,
                question: [
                    { questionId: '656cff5bcf286311cc7b0a77', points: 5 },
                ],
            })
            .set('Authorization', tokenTeacher);
        expect(response.status).toBe(404);
        expect(response.body.message).toBe(
            'Not found question with id in database'
        );
    });
});
