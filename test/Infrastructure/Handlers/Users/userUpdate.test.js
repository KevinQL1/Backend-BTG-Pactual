jest.mock('uuid', () => ({ v4: () => 'mock-uuid-update' }));

const userUpdateHandler = require('#handlers/users/userUpdate.js');
const UserService = require('#services/userService.js');
const httpResponse = require('#utils/httpResponse.js');

jest.mock('#services/userService.js');
jest.mock('#utils/httpResponse.js');

describe('Handler: userUpdate', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            params: { userId: '1037650134' },
            body: { name: 'Kevin Updated', notificationType: 'email' },
            originalUrl: '/api/users/1037650134'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    test('should return 200 (ok) when user is updated successfully', async () => {
        const mockResult = { id: '1037650134', ...req.body };
        UserService.prototype.updateUser.mockResolvedValue(mockResult);

        await userUpdateHandler(req, res);

        expect(UserService.prototype.updateUser).toHaveBeenCalledWith('1037650134', req.body);
        expect(httpResponse.ok).toHaveBeenCalledWith(res, mockResult);
    });

    test('should return 400 (badRequest) if userId is missing', async () => {
        req.params = {};

        await userUpdateHandler(req, res);

        expect(httpResponse.badRequest).toHaveBeenCalled();
    });

    test('should return 404 (notFound) when user does not exist', async () => {
        const error = new Error('User not found');
        UserService.prototype.updateUser.mockRejectedValue(error);

        await userUpdateHandler(req, res);

        expect(httpResponse.notFound).toHaveBeenCalledWith(res, error, expect.anything());
    });

    test('should return 400 (badRequest) for validation errors in the service', async () => {
        const error = new Error('Invalid phone format');
        UserService.prototype.updateUser.mockRejectedValue(error);

        await userUpdateHandler(req, res);

        expect(httpResponse.badRequest).toHaveBeenCalledWith(res, error, expect.anything());
    });
});