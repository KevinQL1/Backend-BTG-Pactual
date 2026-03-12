const fundGetSubscribeByUserIdHandler = require('#handlers/funds/transactions/fundGetSubscribeByUserId.js');
const FundService = require('#services/fundService.js');
const { ok, badRequest, serverError } = require('#utils/httpResponse.js');

jest.mock('#services/fundService.js');
jest.mock('#utils/httpResponse.js');

describe('Handler: fundGetSubscribeByUserId', () => {
    let req, res;
    let mockFundServiceInstance;

    beforeEach(() => {
        req = {
            params: { userId: 'USER#1037650134' },
            originalUrl: '/api/funds/subscriptions/USER#1037650134'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        mockFundServiceInstance = {
            getSubscriptionsByUserId: jest.fn()
        };
        FundService.mockImplementation(() => mockFundServiceInstance);

        jest.clearAllMocks();
    });

    test('Debe retornar 200 y las suscripciones si el userId existe y es válido', async () => {
        const mockData = [{ fundId: 'BTG_FONDO_1', fundName: 'Fondo Prueba', amount: 50000 }];
        mockFundServiceInstance.getSubscriptionsByUserId.mockResolvedValue(mockData);

        await fundGetSubscribeByUserIdHandler(req, res);

        expect(FundService).toHaveBeenCalled();
        expect(mockFundServiceInstance.getSubscriptionsByUserId).toHaveBeenCalledWith('USER#1037650134');
        expect(ok).toHaveBeenCalledWith(res, mockData);
    });

    test('Debe retornar badRequest si no se envía el userId', async () => {
        req.params.userId = undefined;

        await fundGetSubscribeByUserIdHandler(req, res);

        expect(badRequest).toHaveBeenCalledWith(res, expect.any(Error), req.originalUrl);
        const errorPassed = badRequest.mock.calls[0][1];
        expect(errorPassed.message).toBe("userId is required");
    });

    test('Debe retornar badRequest si el servicio lanza "Subscription not found"', async () => {
        const userId = 'USER#1037650134';
        const customError = new Error(`Subscription not found for this user ${userId}`);
        mockFundServiceInstance.getSubscriptionsByUserId.mockRejectedValue(customError);

        await fundGetSubscribeByUserIdHandler(req, res);

        expect(badRequest).toHaveBeenCalledWith(res, customError, req.originalUrl);
        expect(serverError).not.toHaveBeenCalled();
    });

    test('Debe retornar serverError si el servicio lanza una excepción genérica', async () => {
        const errorMsg = 'Database connection failed';
        mockFundServiceInstance.getSubscriptionsByUserId.mockRejectedValue(new Error(errorMsg));

        await fundGetSubscribeByUserIdHandler(req, res);

        expect(serverError).toHaveBeenCalledWith(res, errorMsg, req.originalUrl);
        expect(badRequest).not.toHaveBeenCalled();
    });
});