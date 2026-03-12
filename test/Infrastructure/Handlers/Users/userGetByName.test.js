jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }));

const userGetByNameHandler = require('#handlers/users/userGetByName.js');
const UserService = require('#services/userService.js');
const httpResponse = require('#utils/httpResponse.js');

jest.mock('#services/userService.js');
jest.mock('#utils/httpResponse.js');

describe('Handler: userGetByName', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            query: { name: 'Kevin' },
            originalUrl: '/api/users/search?name=Kevin'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    test('should return 200 (ok) when users are found by name', async () => {
        const mockUsers = [{ id: '1037650134', name: 'Kevin Quintero' }];
        UserService.prototype.getUserByName.mockResolvedValue(mockUsers);

        await userGetByNameHandler(req, res);

        expect(UserService.prototype.getUserByName).toHaveBeenCalledWith('Kevin');
        expect(httpResponse.ok).toHaveBeenCalledWith(res, mockUsers);
    });

    test('should return 400 (badRequest) if name is missing (checking your current logic)', async () => {
        req.query = {};

        await userGetByNameHandler(req, res);

        expect(httpResponse.badRequest).toHaveBeenCalledWith(
            res,
            expect.objectContaining({ message: 'Missing name param' }),
            req.originalUrl
        );
    });

    test('should return 404 (notFound) when service fails', async () => {
        const error = new Error('Database error');
        UserService.prototype.getUserByName.mockRejectedValue(error);

        await userGetByNameHandler(req, res);

        expect(httpResponse.notFound).toHaveBeenCalledWith(res, error, req.originalUrl);
    });
});