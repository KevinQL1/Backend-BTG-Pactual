jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }));

const fundGetByIdHandler = require('#handlers/funds/fundGetById.js');
const FundService = require('#services/fundService.js');
const httpResponse = require('#utils/httpResponse.js');

jest.mock('#services/fundService.js');
jest.mock('#utils/httpResponse.js');

describe('Handler: fundGetById', () => {
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

    test('should return 200 (ok) when fund is found', async () => {
        const mockFund = { pk: 'FUND#FP_VISTA', name: 'Fondo Vista', minimumAmount: 75000 };
        FundService.prototype.getFundById.mockResolvedValue(mockFund);

        await fundGetByIdHandler(req, res);

        expect(FundService.prototype.getFundById).toHaveBeenCalledWith('FP_VISTA');
        expect(httpResponse.ok).toHaveBeenCalledWith(res, mockFund);
    });

    test('should return 400 (badRequest) if fundId is missing', async () => {
        req.params = {};

        await fundGetByIdHandler(req, res);

        expect(httpResponse.badRequest).toHaveBeenCalled();
        expect(FundService.prototype.getFundById).not.toHaveBeenCalled();
    });

    test('should return 404 (notFound) when fund does not exist', async () => {
        const error = new Error('Fund not found');
        FundService.prototype.getFundById.mockRejectedValue(error);

        await fundGetByIdHandler(req, res);

        expect(httpResponse.notFound).toHaveBeenCalledWith(res, error, req.originalUrl);
    });
});