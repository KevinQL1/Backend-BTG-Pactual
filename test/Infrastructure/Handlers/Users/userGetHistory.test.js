jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }));

const userGetHistoryHandler = require('#handlers/users/userGetHistory.js');
const UserService = require('#services/userService.js');
const httpResponse = require('#utils/httpResponse.js');

jest.mock('#services/userService.js');
jest.mock('#utils/httpResponse.js');

describe('Handler: userGetHistory', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            params: { userId: '1037650134' },
            originalUrl: '/api/users/1037650134/history'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    test('should return 200 (ok) with user transaction history', async () => {
        const mockHistory = [
            { sk: 'HISTORY#1', type: 'APERTURA', fundName: 'Fondo A', date: '2026-03-12' },
            { sk: 'HISTORY#2', type: 'CANCELACION', fundName: 'Fondo B', date: '2026-03-13' }
        ];
        UserService.prototype.getUserHistory.mockResolvedValue(mockHistory);

        await userGetHistoryHandler(req, res);

        expect(UserService.prototype.getUserHistory).toHaveBeenCalledWith('1037650134');
        expect(httpResponse.ok).toHaveBeenCalledWith(res, mockHistory);
    });

    test('should return 400 (badRequest) if userId is missing', async () => {
        req.params = {};

        await userGetHistoryHandler(req, res);

        expect(httpResponse.badRequest).toHaveBeenCalledWith(
            res,
            expect.objectContaining({ message: 'Missing user id param' }),
            req.originalUrl
        );
    });

    test('should return 404 (notFound) when user is not found', async () => {
        const error = new Error('User not found');
        UserService.prototype.getUserHistory.mockRejectedValue(error);

        await userGetHistoryHandler(req, res);

        expect(httpResponse.notFound).toHaveBeenCalledWith(res, error, req.originalUrl);
    });

    test('should return 500 (serverError) for other service failures', async () => {
        const error = new Error('Internal DB Error');
        UserService.prototype.getUserHistory.mockRejectedValue(error);

        await userGetHistoryHandler(req, res);

        expect(httpResponse.serverError).toHaveBeenCalledWith(res, req.originalUrl);
    });
});