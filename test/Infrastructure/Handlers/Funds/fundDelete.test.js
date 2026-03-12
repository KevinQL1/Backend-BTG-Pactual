jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }));

const fundDeleteHandler = require('#handlers/funds/fundDelete.js');
const FundService = require('#services/fundService.js');
const httpResponse = require('#utils/httpResponse.js');

jest.mock('#services/fundService.js');
jest.mock('#utils/httpResponse.js');

describe('Handler: fundDelete', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            params: { fundId: 'FP_VISTA' },
            originalUrl: '/api/funds/FP_VISTA'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    test('should return 200 (ok) when fund is deleted successfully', async () => {
        FundService.prototype.deleteFund.mockResolvedValue({ deleted: true });

        await fundDeleteHandler(req, res);

        expect(FundService.prototype.deleteFund).toHaveBeenCalledWith('FP_VISTA');
        expect(httpResponse.ok).toHaveBeenCalledWith(res, { deleted: true, fundId: 'FP_VISTA' });
    });

    test('should return 404 (notFound) when fund to delete does not exist', async () => {
        const error = new Error('Fund not found');
        FundService.prototype.deleteFund.mockRejectedValue(error);

        await fundDeleteHandler(req, res);

        expect(httpResponse.notFound).toHaveBeenCalledWith(res, error, req.originalUrl);
    });

    test('should return 500 (serverError) for unknown exceptions', async () => {
        const error = new Error('Connection lost');
        FundService.prototype.deleteFund.mockRejectedValue(error);

        await fundDeleteHandler(req, res);

        expect(httpResponse.serverError).toHaveBeenCalledWith(res, req.originalUrl);
    });
});