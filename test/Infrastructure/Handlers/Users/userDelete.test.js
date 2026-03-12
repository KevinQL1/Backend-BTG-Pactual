jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }));

const userDeleteHandler = require('#handlers/users/userDelete.js');
const UserService = require('#services/userService.js');
const httpResponse = require('#utils/httpResponse.js');

jest.mock('#services/userService.js');
jest.mock('#utils/httpResponse.js');

describe('Handler: userDelete', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            params: { userId: '1037650134' },
            originalUrl: '/api/users/1037650134'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    test('should return 200 (ok) when user is deleted successfully', async () => {
        UserService.prototype.deleteUser.mockResolvedValue({ deleted: true });

        await userDeleteHandler(req, res);

        expect(UserService.prototype.deleteUser).toHaveBeenCalledWith('1037650134');
        expect(httpResponse.ok).toHaveBeenCalledWith(res, { deleted: true, userId: '1037650134' });
    });

    test('should return 404 (notFound) when user to delete does not exist', async () => {
        const error = new Error('User not found');
        UserService.prototype.deleteUser.mockRejectedValue(error);

        await userDeleteHandler(req, res);

        expect(httpResponse.notFound).toHaveBeenCalledWith(res, error, req.originalUrl);
    });

    test('should return 500 (serverError) for unexpected database errors', async () => {
        const error = new Error('DynamoDB Connection Lost');
        UserService.prototype.deleteUser.mockRejectedValue(error);

        await userDeleteHandler(req, res);

        expect(httpResponse.serverError).toHaveBeenCalledWith(res, req.originalUrl);
    });
});