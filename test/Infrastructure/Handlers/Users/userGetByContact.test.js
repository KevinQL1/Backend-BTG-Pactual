jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }));

const userGetByContactHandler = require('#handlers/users/userGetByContact.js');
const UserService = require('#services/userService.js');
const httpResponse = require('#utils/httpResponse.js');

jest.mock('#services/userService.js');
jest.mock('#utils/httpResponse.js');

describe('Handler: userGetByContact', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            query: { type: 'EMAIL', value: 'kevin@test.com' },
            originalUrl: '/api/users/contact?type=EMAIL&value=kevin@test.com'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    test('should return 200 (ok) and normalize type to lowercase', async () => {
        const mockUser = { pk: 'USER#1', email: 'kevin@test.com' };
        UserService.prototype.getUserByContact.mockResolvedValue(mockUser);

        await userGetByContactHandler(req, res);

        expect(UserService.prototype.getUserByContact).toHaveBeenCalledWith('email', 'kevin@test.com');
        expect(httpResponse.ok).toHaveBeenCalledWith(res, mockUser);
    });

    test('should return 400 (badRequest) if type or value are missing', async () => {
        req.query = { type: 'email' };

        await userGetByContactHandler(req, res);

        expect(httpResponse.badRequest).toHaveBeenCalled();
    });

    test('should return 400 (badRequest) if service throws an invalid type error', async () => {
        const error = new Error('Invalid contact type');
        UserService.prototype.getUserByContact.mockRejectedValue(error);

        await userGetByContactHandler(req, res);

        expect(httpResponse.badRequest).toHaveBeenCalledWith(res, error, req.originalUrl);
    });

    test('should return 404 (notFound) for other errors like user not found', async () => {
        const error = new Error('User not found');
        UserService.prototype.getUserByContact.mockRejectedValue(error);

        await userGetByContactHandler(req, res);

        expect(httpResponse.notFound).toHaveBeenCalledWith(res, error, req.originalUrl);
    });
});