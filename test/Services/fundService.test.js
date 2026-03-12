const FundService = require('#services/fundService.js');
const DynamoDbAdapter = require('#adapters/dynamoAdapter.js');
const UserService = require('#services/userService.js');
const NotificationEmailService = require('#services/notificationEmailService.js');
const NotificationSMSService = require('#services/notificationSMSService.js');

jest.mock('#adapters/dynamoAdapter.js');
jest.mock('#services/userService.js');
jest.mock('#services/notificationEmailService.js');
jest.mock('#services/notificationSMSService.js');
jest.mock('uuid', () => ({ v4: () => 'mock-uuid-123' }));

describe('Service: FundService (Full Coverage)', () => {
    let fundService;

    const validFundData = {
        pk: 'FUND#VISTA',
        sk: 'METADATA',
        name: 'Fondo Vista',
        minimumAmount: 75000,
        category: 'FIC'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        fundService = new FundService();
    });

    // 1. CREATE FUND
    describe('createFund', () => {
        test('should create a fund successfully', async () => {
            DynamoDbAdapter.prototype.getByName.mockResolvedValue([]);
            DynamoDbAdapter.prototype.getItemByPrimaryKey.mockResolvedValue(null);
            DynamoDbAdapter.prototype.saveItem.mockResolvedValue(validFundData);

            const result = await fundService.createFund(validFundData);
            expect(result).toBeDefined();
            expect(DynamoDbAdapter.prototype.saveItem).toHaveBeenCalled();
        });

        test('should throw error if fund name already exists', async () => {
            DynamoDbAdapter.prototype.getByName.mockResolvedValue([validFundData]);
            await expect(fundService.createFund(validFundData))
                .rejects.toThrow(/already exists/);
        });
    });

    // 2. GET ALL FUNDS
    describe('getAllFunds', () => {
        test('should return all funds as entities', async () => {
            DynamoDbAdapter.prototype.getAllBySkPrefix.mockResolvedValue([validFundData]);
            const result = await fundService.getAllFunds();
            expect(result[0].name).toBe('Fondo Vista');
            expect(result).toHaveLength(1);
        });
    });

    // 3. GET FUND BY ID
    describe('getFundById', () => {
        test('should return fund if exists', async () => {
            DynamoDbAdapter.prototype.getItemByPrimaryKey.mockResolvedValue(validFundData);
            const result = await fundService.getFundById('VISTA');
            expect(result.name).toBe('Fondo Vista');
        });

        test('should throw error if fund does not exist', async () => {
            DynamoDbAdapter.prototype.getItemByPrimaryKey.mockResolvedValue(null);
            await expect(fundService.getFundById('NONEXISTENT')).rejects.toThrow('Fund not found');
        });
    });

    // 4. GET FUND BY NAME
    describe('getFundByName', () => {
        test('should return matches for a name', async () => {
            DynamoDbAdapter.prototype.getByName.mockResolvedValue([validFundData]);
            const result = await fundService.getFundByName('Vista');
            expect(result[0].name).toBe('Fondo Vista');
        });

        test('should throw error if no matches found', async () => {
            DynamoDbAdapter.prototype.getByName.mockResolvedValue([]);
            await expect(fundService.getFundByName('X')).rejects.toThrow(/No funds found/);
        });
    });

    // 5. GET TRANSACTION BY ID
    describe('getTransactionById', () => {
        test('should return user history record', async () => {
            const mockTx = { pk: 'USER#1', sk: 'HISTORY#TX1', amount: 50000 };
            DynamoDbAdapter.prototype.getItemByPrimaryKey.mockResolvedValue(mockTx);
            const result = await fundService.getTransactionById('1', 'TX1');
            expect(result.idTransaction).toBe('TX1');
        });
    });

    // 6. UPDATE FUND
    describe('updateFund', () => {
        test('should update existing fund', async () => {
            DynamoDbAdapter.prototype.getItemByPrimaryKey.mockResolvedValue(validFundData);
            DynamoDbAdapter.prototype.updateItem.mockResolvedValue({ ...validFundData, name: 'New Name' });
            const result = await fundService.updateFund('VISTA', { name: 'New Name' });
            expect(result.name).toBe('New Name');
        });
    });

    // 7. DELETE FUND
    describe('deleteFund', () => {
        test('should delete existing fund', async () => {
            DynamoDbAdapter.prototype.getItemByPrimaryKey.mockResolvedValue(validFundData);
            DynamoDbAdapter.prototype.deleteItem.mockResolvedValue({ deleted: true });
            const result = await fundService.deleteFund('VISTA');
            expect(result.deleted).toBe(true);
        });
    });

    // 8. NOTIFY USER
    describe('notifyUser', () => {
        test('should call email service for email users', async () => {
            const user = { notificationType: 'email', email: 'k@t.com', name: 'Kevin' };
            await fundService.notifyUser(user, 'Vista', 'SUBSCRIPTION', 425000);
            expect(NotificationEmailService.prototype.send).toHaveBeenCalled();
        });

        test('should call sms service for sms users', async () => {
            const user = { notificationType: 'sms', phone: '300', name: 'Kevin' };
            await fundService.notifyUser(user, 'Vista', 'UNSUBSCRIBE', 500000);
            expect(NotificationSMSService.prototype.send).toHaveBeenCalled();
        });
    });

    // 9. SUBSCRIBE TO FUND
    describe('subscribeToFund', () => {
        test('should execute full subscription flow', async () => {
            const user = { id: '123', balance: 500000, notificationType: 'email' };
            UserService.prototype.getUserById.mockResolvedValue(user);
            DynamoDbAdapter.prototype.getItemByPrimaryKey.mockResolvedValue(validFundData);
            UserService.prototype.validateUserBalance.mockResolvedValue(425000);

            const result = await fundService.subscribeToFund('123', 'VISTA');
            expect(result.transactionId).toBe('mock-uuid-123');
            expect(result.newBalance).toBe(425000);
            expect(DynamoDbAdapter.prototype.executeSubscriptionTransaction).toHaveBeenCalled();
        });
    });

    // 10. UNSUBSCRIBE FROM FUND
    describe('unsubscribeFromFund', () => {
        test('should execute full cancellation flow', async () => {
            const user = { id: '123', balance: 425000, notificationType: 'sms' };
            UserService.prototype.getUserById.mockResolvedValue(user);
            DynamoDbAdapter.prototype.getItemByPrimaryKey
                .mockResolvedValueOnce({ pk: 'USER#123', sk: 'SUBSCRIPTION#VISTA' })
                .mockResolvedValueOnce(validFundData);

            DynamoDbAdapter.prototype.executeCancelationTransaction.mockResolvedValue({ ok: true });

            const result = await fundService.unsubscribeFromFund('123', 'VISTA');
            expect(result.ok).toBe(true);
            expect(NotificationSMSService.prototype.send).toHaveBeenCalled();
        });
    });
});