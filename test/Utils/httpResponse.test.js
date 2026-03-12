const { ok, serverError, badRequest, notFound } = require('#utils/httpResponse.js');

describe('Utils: httpResponse', () => {
    let res;

    beforeEach(() => {
        res = {
            header: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    describe('ok()', () => {
        test('should send 200 status and correct headers', () => {
            const body = { message: 'success' };
            ok(res, body);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(body);
            expect(res.header).toHaveBeenCalledWith('Content-Type', 'application/json');
            expect(res.header).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
        });
    });

    describe('serverError()', () => {
        test('should send 500 status and problem+json header', () => {
            const path = '/api/test';
            serverError(res, path);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.header).toHaveBeenCalledWith('Content-Type', 'application/problem+json');
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                type: 'urn:problem:server-error',
                instance: path
            }));
        });
    });

    describe('badRequest()', () => {
        test('should send 400 and include error message', () => {
            const error = { message: 'Invalid data' };
            badRequest(res, error, '/api/users');

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Bad Request',
                detail: 'Invalid data'
            }));
        });
    });

    describe('notFound()', () => {
        test('should send 404 and correct instance path', () => {
            const error = { message: 'User not found' };
            notFound(res, error, '/api/users/123');

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 404,
                instance: '/api/users/123'
            }));
        });
    });
});