jest.mock('uuid', () => ({ v4: () => 'mock-uuid-update' }));

const fundUpdateHandler = require('#handlers/funds/fundUpdate.js');
const FundService = require('#services/fundService.js');
const httpResponse = require('#utils/httpResponse.js');

jest.mock('#services/fundService.js');
jest.mock('#utils/httpResponse.js');

describe('Handler: fundUpdate', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            params: { fundId: 'FP_VISTA' },
            body: { minimumAmount: 80000 },
            originalUrl: '/api/funds/FP_VISTA'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    test('should return 200 (ok) when fund is updated successfully', async () => {
        const mockResult = { pk: 'FUND#FP_VISTA', name: 'Fondo Vista', minimumAmount: 80000 };
        FundService.prototype.updateFund.mockResolvedValue(mockResult);

        await fundUpdateHandler(req, res);

        expect(FundService.prototype.updateFund).toHaveBeenCalledWith('FP_VISTA', req.body);
        expect(httpResponse.ok).toHaveBeenCalledWith(res, mockResult);
    });

    test('should return 400 (badRequest) if fundId is missing', async () => {
        req.params = {};

        await fundUpdateHandler(req, res);

        expect(httpResponse.badRequest).toHaveBeenCalled();
        expect(FundService.prototype.updateFund).not.toHaveBeenCalled();
    });

    test('should return 404 (notFound) when fund to update does not exist', async () => {
        const error = new Error('Fund not found');
        FundService.prototype.updateFund.mockRejectedValue(error);

        await fundUpdateHandler(req, res);

        expect(httpResponse.notFound).toHaveBeenCalledWith(res, error, req.originalUrl);
    });

    test('should return 400 (badRequest) for other service errors', async () => {
        const error = new Error('Invalid data provided');
        FundService.prototype.updateFund.mockRejectedValue(error);

        await fundUpdateHandler(req, res);

        expect(httpResponse.badRequest).toHaveBeenCalledWith(res, error, req.originalUrl);
    });
});