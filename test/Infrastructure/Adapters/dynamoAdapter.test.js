const DynamoDbAdapter = require('#adapters/dynamoAdapter.js');
const {
    PutCommand,
    ScanCommand,
    QueryCommand,
    UpdateCommand,
    TransactWriteCommand
} = require('@aws-sdk/lib-dynamodb');

jest.mock('@aws-sdk/lib-dynamodb', () => {
    const mockSend = jest.fn();
    return {
        DynamoDBDocumentClient: {
            from: jest.fn().mockReturnValue({ send: mockSend })
        },
        PutCommand: jest.fn(),
        GetCommand: jest.fn(),
        ScanCommand: jest.fn(),
        UpdateCommand: jest.fn(),
        DeleteCommand: jest.fn(),
        TransactWriteCommand: jest.fn(),
        QueryCommand: jest.fn()
    };
});

describe('DynamoDbAdapter - Full Coverage', () => {
    let adapter;
    let mockDocClient;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.DYNAMODB_TABLE = 'TestTable';
        adapter = new DynamoDbAdapter();
        mockDocClient = adapter.docClient;
    });

    // 1. SaveItem
    test('saveItem should send a PutCommand', async () => {
        const item = { pk: '1', sk: 'A' };
        mockDocClient.send.mockResolvedValue({});
        const result = await adapter.saveItem(item);
        expect(mockDocClient.send).toHaveBeenCalledWith(expect.any(PutCommand));
        expect(result).toEqual(item);
    });

    // 2. GetItemByPrimaryKey
    test('getItemByPrimaryKey should return item or null', async () => {
        mockDocClient.send.mockResolvedValue({ Item: { pk: '1' } });
        const result = await adapter.getItemByPrimaryKey('1', 'A');
        expect(result).toEqual({ pk: '1' });
    });

    // 3. getAllBySkPrefix (Scan)
    test('getAllBySkPrefix should return list of items', async () => {
        mockDocClient.send.mockResolvedValue({ Items: [{ pk: '1' }, { pk: '2' }] });
        const result = await adapter.getAllBySkPrefix('PROFILE');
        expect(mockDocClient.send).toHaveBeenCalledWith(expect.any(ScanCommand));
        expect(result.length).toBe(2);
    });

    // 4. getByName (Scan con contains)
    test('getByName should return filtered items', async () => {
        mockDocClient.send.mockResolvedValue({ Items: [{ name: 'Test Fund' }] });
        const result = await adapter.getByName('METADATA', 'Test');
        expect(mockDocClient.send).toHaveBeenCalledWith(expect.any(ScanCommand));
        expect(result[0].name).toBe('Test Fund');
    });

    // 5. getByAttribute (Scan genérico)
    test('getByAttribute should return the first match', async () => {
        mockDocClient.send.mockResolvedValue({ Items: [{ email: 'k@test.com' }] });
        const result = await adapter.getByAttribute('PROFILE', 'email', 'k@test.com');
        expect(result.email).toBe('k@test.com');
    });

    // 6. getHistoryByPk (Query)
    test('getHistoryByPk should call QueryCommand', async () => {
        mockDocClient.send.mockResolvedValue({ Items: [{ sk: 'HISTORY#123' }] });
        const result = await adapter.getHistoryByPk('USER#1', 'HISTORY#');
        expect(mockDocClient.send).toHaveBeenCalledWith(expect.any(QueryCommand));
        expect(result.length).toBe(1);
    });

    // 7. deleteItem
    test('deleteItem should return deleted true', async () => {
        mockDocClient.send.mockResolvedValue({});
        const result = await adapter.deleteItem('1', 'A');
        expect(result.deleted).toBe(true);
    });

    // 8. updateItem (Dynamic Update)
    test('updateItem should build correct command and return attributes', async () => {
        mockDocClient.send.mockResolvedValue({ Attributes: { name: 'New Name' } });
        const result = await adapter.updateItem('1', 'A', { name: 'New Name' });
        expect(mockDocClient.send).toHaveBeenCalledWith(expect.any(UpdateCommand));
        expect(result.name).toBe('New Name');
    });

    // 9. executeSubscriptionTransaction (Apertura)
    test('executeSubscriptionTransaction should call TransactWriteCommand', async () => {
        mockDocClient.send.mockResolvedValue({});
        const result = await adapter.executeSubscriptionTransaction('U1', 'F1', 'FundA', 100, 'T1');
        expect(mockDocClient.send).toHaveBeenCalledWith(expect.any(TransactWriteCommand));
        expect(result).toHaveProperty('transactionId', 'T1');
        expect(result).toHaveProperty('timestamp');
    });

    // 10. executeCancelationTransaction (Cancelación)
    test('executeCancelationTransaction should call TransactWriteCommand', async () => {
        mockDocClient.send.mockResolvedValue({});
        const result = await adapter.executeCancelationTransaction('U1', 'F1', 'FundA', 50, 150, 'T2');
        expect(mockDocClient.send).toHaveBeenCalledWith(expect.any(TransactWriteCommand));
        expect(result).toHaveProperty('transactionId', 'T2');
    });

    test('should wrap errors in custom message', async () => {
        mockDocClient.send.mockRejectedValue(new Error('Dynamo Fail'));
        await expect(adapter.getItemByPrimaryKey('1', 'A')).rejects.toThrow('Error en getItemByPrimaryKey: Dynamo Fail');
    });
});