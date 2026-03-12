jest.mock('uuid', () => ({ v4: () => 'mock-user-uuid' }));

const userCreateHandler = require('#handlers/users/userCreate.js');
const UserService = require('#services/userService.js');
const httpResponse = require('#utils/httpResponse.js');

jest.mock('#services/userService.js');
jest.mock('#utils/httpResponse.js');

describe('Handler: userCreate', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            body: {
                pk: '1037650134',
                name: 'Kevin Quintero',
                balance: 500000,
                notificationType: 'sms',
                phone: '3001234567'
            },
            originalUrl: '/api/users'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    test('should return 200 (ok) when user is created successfully', async () => {
        const mockResult = { ...req.body, status: 'created' };
        UserService.prototype.createUser.mockResolvedValue(mockResult);

        await userCreateHandler(req, res);

        expect(UserService.prototype.createUser).toHaveBeenCalledWith(req.body);
        expect(httpResponse.ok).toHaveBeenCalledWith(res, mockResult);
    });

    test('should return 400 (badRequest) when service fails (e.g., duplicate user or validation error)', async () => {
        const error = new Error('User with ID 1037650134 already exists');
        UserService.prototype.createUser.mockRejectedValue(error);

        await userCreateHandler(req, res);

        expect(UserService.prototype.createUser).toHaveBeenCalledWith(req.body);
        expect(httpResponse.badRequest).toHaveBeenCalledWith(res, error, req.originalUrl);
    });
});