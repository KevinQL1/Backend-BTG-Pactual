jest.mock('uuid', () => ({ v4: () => 'mock-uuid-1234' }));

const fundUnsubscribeHandler = require('#handlers/funds/transactions/fundUnsubscribe.js');
const FundService = require('#services/fundService.js');
const httpResponse = require('#utils/httpResponse.js');

jest.mock('#services/fundService.js');
jest.mock('#utils/httpResponse.js');

describe('Handler: fundUnsubscribe', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            body: { userId: '1037650134', fundId: 'FP_VISTA' },
            originalUrl: '/api/funds/unsubscribe'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    test('should return 200 (ok) when unsubscription is successful', async () => {
        const mockResult = { transactionId: 'TX-999', status: 'unsubscribed' };
        FundService.prototype.unsubscribeFromFund.mockResolvedValue(mockResult);

        await fundUnsubscribeHandler(req, res);

        expect(FundService.prototype.unsubscribeFromFund).toHaveBeenCalledWith('1037650134', 'FP_VISTA');
        expect(httpResponse.ok).toHaveBeenCalledWith(res, mockResult);
    });

    test('should return 400 (badRequest) if userId or fundId are missing', async () => {
        req.body = { userId: '123' }; // Falta fundId

        await fundUnsubscribeHandler(req, res);

        expect(httpResponse.badRequest).toHaveBeenCalled();
        expect(FundService.prototype.unsubscribeFromFund).not.toHaveBeenCalled();
    });

    test('should return 400 (badRequest) when service throws an error', async () => {
        const error = new Error('Subscription not found for this user');
        FundService.prototype.unsubscribeFromFund.mockRejectedValue(error);

        await fundUnsubscribeHandler(req, res);

        expect(httpResponse.badRequest).toHaveBeenCalledWith(res, error, req.originalUrl);
    });
});