jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }));

const userGetTransactionByIdHandler = require('#handlers/users/userGetTransactionById.js');
const FundService = require('#services/fundService.js');
const httpResponse = require('#utils/httpResponse.js');

jest.mock('#services/fundService.js');
jest.mock('#utils/httpResponse.js');

describe('Handler: userGetTransactionById', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            params: { userId: '1037650134', transactionId: 'TX-123' },
            originalUrl: '/api/users/1037650134/transactions/TX-123'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    test('should return 200 (ok) when transaction is found', async () => {
        const mockTransaction = {
            pk: 'USER#1037650134',
            sk: 'HISTORY#TX-123',
            type: 'APERTURA',
            amount: 50000
        };
        FundService.prototype.getTransactionById.mockResolvedValue(mockTransaction);

        await userGetTransactionByIdHandler(req, res);

        expect(FundService.prototype.getTransactionById).toHaveBeenCalledWith('1037650134', 'TX-123');
        expect(httpResponse.ok).toHaveBeenCalledWith(res, mockTransaction);
    });

    test('should return 400 (badRequest) if params are missing', async () => {
        req.params = { userId: '1037650134' };

        await userGetTransactionByIdHandler(req, res);

        expect(httpResponse.badRequest).toHaveBeenCalled();
    });

    test('should return 404 (notFound) when transaction does not exist', async () => {
        const error = new Error('Transaction not found');
        FundService.prototype.getTransactionById.mockRejectedValue(error);

        await userGetTransactionByIdHandler(req, res);

        expect(httpResponse.notFound).toHaveBeenCalledWith(res, error, req.originalUrl);
    });
});