jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }));

const userGetByIdHandler = require('#handlers/users/userGetById.js');
const UserService = require('#services/userService.js');
const httpResponse = require('#utils/httpResponse.js');

jest.mock('#services/userService.js');
jest.mock('#utils/httpResponse.js');

describe('Handler: userGetById', () => {
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

    test('should return 200 (ok) when user is found', async () => {
        const mockUser = { id: '1037650134', name: 'Kevin Quintero', balance: 500000 };
        UserService.prototype.getUserById.mockResolvedValue(mockUser);

        await userGetByIdHandler(req, res);

        expect(UserService.prototype.getUserById).toHaveBeenCalledWith('1037650134');
        expect(httpResponse.ok).toHaveBeenCalledWith(res, mockUser);
    });

    test('should return 400 (badRequest) if userId is missing in params', async () => {
        req.params = {};

        await userGetByIdHandler(req, res);

        expect(httpResponse.badRequest).toHaveBeenCalledWith(
            res,
            expect.objectContaining({ message: 'Missing user id param' }),
            req.originalUrl
        );
        expect(UserService.prototype.getUserById).not.toHaveBeenCalled();
    });

    test('should return 404 (notFound) when user does not exist or service fails', async () => {
        const error = new Error('User not found');
        UserService.prototype.getUserById.mockRejectedValue(error);

        await userGetByIdHandler(req, res);

        expect(httpResponse.notFound).toHaveBeenCalledWith(res, error, req.originalUrl);
    });
});
