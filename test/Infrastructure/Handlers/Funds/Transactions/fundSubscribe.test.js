jest.mock('uuid', () => ({ v4: () => '1234-mock-id' }));

const fundSubscribeHandler = require('#handlers/funds/transactions/fundSubscribe.js');
const FundService = require('#services/fundService.js');
const httpResponse = require('#utils/httpResponse.js');

jest.mock('#services/fundService.js');
jest.mock('#utils/httpResponse.js');

describe('Handler: fundSubscribe', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            body: { userId: '1037650134', fundId: 'FP_VISTA' },
            originalUrl: '/api/funds/subscribe'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        next = jest.fn();
    });

    test('should return 200 (ok) when subscription is successful', async () => {
        const mockResult = { transactionId: 'TX-123', status: 'success' };
        FundService.prototype.subscribeToFund.mockResolvedValue(mockResult);

        await fundSubscribeHandler(req, res, next);

        expect(FundService.prototype.subscribeToFund).toHaveBeenCalledWith('1037650134', 'FP_VISTA');
        expect(httpResponse.ok).toHaveBeenCalledWith(res, mockResult);
    });

    test('should return 400 (badRequest) if userId or fundId are missing', async () => {
        req.body = { userId: '123' };

        await fundSubscribeHandler(req, res, next);

        expect(httpResponse.badRequest).toHaveBeenCalled();
        expect(FundService.prototype.subscribeToFund).not.toHaveBeenCalled();
    });

    test('should return 400 (badRequest) when user has insufficient balance', async () => {
        const error = new Error('No tiene saldo disponible');
        FundService.prototype.subscribeToFund.mockRejectedValue(error);

        await fundSubscribeHandler(req, res, next);

        expect(httpResponse.badRequest).toHaveBeenCalledWith(res, error, req.originalUrl);
    });

    test('should return 404 (notFound) when fund or user does not exist', async () => {
        const error = new Error('User not found');
        FundService.prototype.subscribeToFund.mockRejectedValue(error);

        await fundSubscribeHandler(req, res, next);

        expect(httpResponse.notFound).toHaveBeenCalledWith(res, error, req.originalUrl);
    });

    test('should call next(error) for unknown errors', async () => {
        const error = new Error('Database explosion');
        FundService.prototype.subscribeToFund.mockRejectedValue(error);

        await fundSubscribeHandler(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});