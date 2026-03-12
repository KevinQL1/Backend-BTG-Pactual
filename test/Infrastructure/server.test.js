jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }));

const request = require('supertest');
const app = require('#infrastructure/server.js');

// Mockeamos de forma genérica todos los handlers para que respondan 200/201
jest.mock('#handlers/users/userCreate.js', () => jest.fn((req, res) => res.status(201).json({ ok: true })));
jest.mock('#handlers/users/userGetAll.js', () => jest.fn((req, res) => res.status(200).json([])));
jest.mock('#handlers/users/userGetById.js', () => jest.fn((req, res) => res.status(200).json({ ok: true })));
jest.mock('#handlers/users/userUpdate.js', () => jest.fn((req, res) => res.status(200).json({ ok: true })));
jest.mock('#handlers/users/userDelete.js', () => jest.fn((req, res) => res.status(200).json({ ok: true })));
jest.mock('#handlers/users/userGetByName.js', () => jest.fn((req, res) => res.status(200).json([])));
jest.mock('#handlers/users/userGetHistory.js', () => jest.fn((req, res) => res.status(200).json([])));
jest.mock('#handlers/users/userGetByContact.js', () => jest.fn((req, res) => res.status(200).json({ ok: true })));
jest.mock('#infrastructure/Handlers/Users/userGetTransactionById.js', () => jest.fn((req, res) => res.status(200).json({ ok: true })));

jest.mock('#handlers/funds/fundCreate.js', () => jest.fn((req, res) => res.status(201).json({ ok: true })));
jest.mock('#handlers/funds/fundGetAll.js', () => jest.fn((req, res) => res.status(200).json([])));
jest.mock('#handlers/funds/fundGetById.js', () => jest.fn((req, res) => res.status(200).json({ ok: true })));
jest.mock('#handlers/funds/fundUpdate.js', () => jest.fn((req, res) => res.status(200).json({ ok: true })));
jest.mock('#handlers/funds/fundDelete.js', () => jest.fn((req, res) => res.status(200).json({ ok: true })));
jest.mock('#handlers/funds/fundGetByName.js', () => jest.fn((req, res) => res.status(200).json([])));
jest.mock('#handlers/funds/transactions/fundSubscribe.js', () => jest.fn((req, res) => res.status(200).json({ ok: true })));
jest.mock('#handlers/funds/transactions/fundUnsubscribe.js', () => jest.fn((req, res) => res.status(200).json({ ok: true })));

// Mock del validador
jest.mock('#utils/schemaValidator.js', () => {
    return (schema) => (req, res, next) => next();
});

describe('Server.js - Full Routing Coverage', () => {

    describe('User Endpoints', () => {
        test('GET /api/users/contact', async () => {
            const res = await request(app).get('/api/users/contact').query({ type: 'email', value: 'a@a.com' });
            expect(res.status).toBe(200);
        });

        test('GET /api/users/search', async () => {
            const res = await request(app).get('/api/users/search').query({ name: 'test' });
            expect(res.status).toBe(200);
        });

        test('GET /api/users/:userId/history', async () => {
            const res = await request(app).get('/api/users/123/history');
            expect(res.status).toBe(200);
        });

        test('GET /api/users/:userId/history/:transactionId', async () => {
            const res = await request(app).get('/api/users/123/history/abc');
            expect(res.status).toBe(200);
        });

        test('PUT /api/users/:userId', async () => {
            const res = await request(app).put('/api/users/123').send({ name: 'Updated' });
            expect(res.status).toBe(200);
        });

        test('DELETE /api/users/:userId', async () => {
            const res = await request(app).delete('/api/users/123');
            expect(res.status).toBe(200);
        });
    });

    describe('Fund & Transaction Endpoints', () => {
        test('POST /api/funds/subscribe', async () => {
            const res = await request(app).post('/api/funds/subscribe').send({ userId: '1', fundId: 'A' });
            expect(res.status).toBe(200);
        });

        test('DELETE /api/funds/unsubscribe', async () => {
            const res = await request(app).delete('/api/funds/unsubscribe').send({ userId: '1', fundId: 'A' });
            expect(res.status).toBe(200);
        });

        test('GET /api/funds/:fundId', async () => {
            const res = await request(app).get('/api/funds/FIC_VISTA');
            expect(res.status).toBe(200);
        });
    });

    describe('Error Middleware', () => {
        test('should return 500 when a handler crashes', async () => {
            const userGetAll = require('#handlers/users/userGetAll.js');
            userGetAll.mockImplementationOnce((req, res, next) => next(new Error('Fatal Crash')));

            const res = await request(app).get('/api/users/getAll');
            expect(res.status).toBe(500);
        });
    });
});