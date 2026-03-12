jest.mock('uuid', () => ({ v4: () => 'mock-uuid-999' }));

const fundCreateHandler = require('#handlers/funds/fundCreate.js');
const FundService = require('#services/fundService.js');
const httpResponse = require('#utils/httpResponse.js');

jest.mock('#services/fundService.js');
jest.mock('#utils/httpResponse.js');

describe('Handler: fundCreate', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            body: {
                pk: 'FUND#FP_VISTA',
                name: 'FONDO DE INVERSION VISTA',
                minimumAmount: 75000,
                category: 'FIC'
            },
            originalUrl: '/api/funds'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    test('should return 200 (ok) when fund is created successfully', async () => {
        const mockResult = { ...req.body, status: 'created' };
        FundService.prototype.createFund.mockResolvedValue(mockResult);

        await fundCreateHandler(req, res);

        expect(FundService.prototype.createFund).toHaveBeenCalledWith(req.body);
        expect(httpResponse.ok).toHaveBeenCalledWith(res, mockResult);
    });

    test('should return 400 (badRequest) when service fails (e.g., duplicate fund)', async () => {
        const error = new Error('Fund with name "FONDO DE INVERSION VISTA" already exists');
        FundService.prototype.createFund.mockRejectedValue(error);

        await fundCreateHandler(req, res);

        expect(FundService.prototype.createFund).toHaveBeenCalledWith(req.body);
        expect(httpResponse.badRequest).toHaveBeenCalledWith(res, error, req.originalUrl);
    });
});