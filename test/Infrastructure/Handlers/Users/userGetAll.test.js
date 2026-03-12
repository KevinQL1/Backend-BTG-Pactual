jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }));

const userGetAllHandler = require('#handlers/users/userGetAll.js');
const UserService = require('#services/userService.js');
const httpResponse = require('#utils/httpResponse.js');

jest.mock('#services/userService.js');
jest.mock('#utils/httpResponse.js');

describe('Handler: userGetAll', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            originalUrl: '/api/users'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    test('should return 200 (ok) with a list of all users', async () => {
        const mockUsers = [
            { pk: 'USER#1', name: 'Kevin', balance: 500000 },
            { pk: 'USER#2', name: 'Andrés', balance: 300000 }
        ];
        UserService.prototype.getAllUsers.mockResolvedValue(mockUsers);

        await userGetAllHandler(req, res);

        expect(UserService.prototype.getAllUsers).toHaveBeenCalled();
        expect(httpResponse.ok).toHaveBeenCalledWith(res, mockUsers);
    });

    test('should return 500 (serverError) when the service fails', async () => {
        const error = new Error('Scan operation failed');
        UserService.prototype.getAllUsers.mockRejectedValue(error);

        await userGetAllHandler(req, res);

        expect(httpResponse.serverError).toHaveBeenCalledWith(res, req.originalUrl);
    });
});