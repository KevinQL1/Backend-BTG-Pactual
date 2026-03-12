jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }));

const fundGetAllHandler = require('#handlers/funds/fundGetAll.js');
const FundService = require('#services/fundService.js');
const httpResponse = require('#utils/httpResponse.js');

jest.mock('#services/fundService.js');
jest.mock('#utils/httpResponse.js');

describe('Handler: fundGetAll', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            originalUrl: '/api/funds'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    test('should return 200 (ok) with the list of funds', async () => {
        const mockFunds = [
            { pk: 'FUND#1', name: 'Fondo A', minimumAmount: 10000 },
            { pk: 'FUND#2', name: 'Fondo B', minimumAmount: 20000 }
        ];
        FundService.prototype.getAllFunds.mockResolvedValue(mockFunds);

        await fundGetAllHandler(req, res);

        expect(FundService.prototype.getAllFunds).toHaveBeenCalled();
        expect(httpResponse.ok).toHaveBeenCalledWith(res, mockFunds);
    });

    test('should return 500 (serverError) when the service fails', async () => {
        const error = new Error('Database connection failed');
        FundService.prototype.getAllFunds.mockRejectedValue(error);

        await fundGetAllHandler(req, res);

        expect(httpResponse.serverError).toHaveBeenCalledWith(res, req.originalUrl);
    });
});