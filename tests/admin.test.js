const mongoose = require('mongoose');
const request = require('supertest');

const app = require('../src/server');

require('dotenv').config();

/* Connecting to the database before each test. */
beforeEach(async () => {
    await mongoose.connect(process.env.MONGO_CONNECTION_STRING);
});

/* Closing database connection after each test. */
afterEach(async () => {
    await mongoose.connection.close();
});

afterAll(async (done) => {
    await app.close(); // Đóng server
    done();
});

// describe('POST /api/adin/register', () => {
//     it('should return a new user', async () => {
//         const res = await request(app).post('/api/adin/register').send({
//             username: 'JohnEvent',
//             password: '123456789a',
//             role: 3,
//         });
//         expect(res.statusCode).toBe(201);
//         expect(res.body).toBe({
//             message: 'Create account oke',
//             user: {
//                 username: 'JohnEvent',
//                 role: 'student',
//             },
//         });
//     });
// });

describe('POST /api/admin/login', () => {
    it('should login account', async () => {
        const res = await request(app).post('/api/admin/login').send({
            username: 'admin',
            password: '123456789a',
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('user login successfull');
    });

    it('should not login account'),
        async () => {
            const res = await request(app).post('/api/admin/login').send({
                username: 'adminabc',
                password: '123456789a',
            });
            expect(res.statusCode).toBe();
            expect(res.body.message).toBe('user login successfull');
        };
});

// describe('PUT /api/products/:id', () => {
//     it('should update a product', async () => {
//         const res = await request(app)
//             .patch('/api/products/6331abc9e9ececcc2d449e44')
//             .send({
//                 name: 'Product 4',
//                 price: 104,
//                 description: 'Description 4',
//             });
//         expect(res.statusCode).toBe(200);
//         expect(res.body.price).toBe(104);
//     });
// });

// describe('DELETE /api/products/:id', () => {
//     it('should delete a product', async () => {
//         const res = await request(app).delete(
//             '/api/products/6331abc9e9ececcc2d449e44'
//         );
//         expect(res.statusCode).toBe(200);
//     });
// });
