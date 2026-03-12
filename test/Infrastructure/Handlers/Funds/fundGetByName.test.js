jest.mock('uuid', () => ({ v4: () => 'mock-uuid-query' }));

const fundGetByNameHandler = require('#handlers/funds/fundGetByName.js');
const FundService = require('#services/fundService.js');
const httpResponse = require('#utils/httpResponse.js');

jest.mock('#services/fundService.js');
jest.mock('#utils/httpResponse.js');

describe('Handler: fundGetByName', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            query: { name: 'VISTA' },
            originalUrl: '/api/funds/search?name=VISTA'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    test('should return 200 (ok) when funds are found by name', async () => {
        const mockFunds = [{ pk: 'FUND#FP_VISTA', name: 'FONDO DE INVERSION VISTA' }];
        FundService.prototype.getFundByName.mockResolvedValue(mockFunds);

        await fundGetByNameHandler(req, res);

        expect(FundService.prototype.getFundByName).toHaveBeenCalledWith('VISTA');
        expect(httpResponse.ok).toHaveBeenCalledWith(res, mockFunds);
    });

    test('should return 400 (badRequest) if name query param is missing', async () => {
        req.query = {};

        await fundGetByNameHandler(req, res);

        expect(httpResponse.badRequest).toHaveBeenCalled();
        expect(FundService.prototype.getFundByName).not.toHaveBeenCalled();
    });

    test('should return 404 (notFound) when service throws error or no funds match', async () => {
        const error = new Error('No funds found');
        FundService.prototype.getFundByName.mockRejectedValue(error);

        await fundGetByNameHandler(req, res);

        expect(httpResponse.notFound).toHaveBeenCalledWith(res, error, req.originalUrl);
    });
});
