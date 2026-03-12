const UserService = require('#services/userService.js');
const DynamoDbAdapter = require('#adapters/dynamoAdapter.js');
const UserEntity = require('#entities/userEntity.js');

jest.mock('#adapters/dynamoAdapter.js');

describe('Service: UserService (Full 100% Coverage)', () => {
    let userService;

    const validUserData = {
        pk: 'USER#1037650134',
        id: '1037650134',
        name: 'Kevin Quintero',
        balance: 500000,
        notificationType: 'email',
        email: 'kevin@test.com',
        phone: '3001234567'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        userService = new UserService();
    });

    // 1. CREATE USER
    describe('createUser', () => {
        test('should create user successfully', async () => {
            DynamoDbAdapter.prototype.getItemByPrimaryKey.mockResolvedValue(null);
            DynamoDbAdapter.prototype.getByAttribute.mockResolvedValue(null);
            DynamoDbAdapter.prototype.saveItem.mockResolvedValue(validUserData);

            const result = await userService.createUser(validUserData);
            expect(result.balance).toBe(500000);
        });

        test('should throw error if ID already exists', async () => {
            DynamoDbAdapter.prototype.getItemByPrimaryKey.mockResolvedValue(validUserData);
            await expect(userService.createUser(validUserData))
                .rejects.toThrow('User with ID 1037650134 already exists');
        });

        test('should throw error if email already exists', async () => {
            DynamoDbAdapter.prototype.getItemByPrimaryKey.mockResolvedValue(null);
            DynamoDbAdapter.prototype.getByAttribute.mockResolvedValueOnce(validUserData);

            await expect(userService.createUser(validUserData))
                .rejects.toThrow('User with email kevin@test.com already exists');
        });

        test('should throw error if phone already exists', async () => {
            DynamoDbAdapter.prototype.getItemByPrimaryKey.mockResolvedValue(null);
            DynamoDbAdapter.prototype.getByAttribute
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce(validUserData);

            await expect(userService.createUser(validUserData))
                .rejects.toThrow('User with phone 3001234567 already exists');
        });

        test('should throw error if balance is less than 500,000', async () => {
            const lowBalance = { ...validUserData, balance: 400000 };
            await expect(userService.createUser(lowBalance))
                .rejects.toThrow('The balance could not be less than $500,000');
        });
    });

    // 2. GET USER BY ID
    describe('getUserById', () => {
        test('should return UserEntity if found', async () => {
            DynamoDbAdapter.prototype.getItemByPrimaryKey.mockResolvedValue(validUserData);
            const result = await userService.getUserById('1037650134');
            expect(result).toBeInstanceOf(UserEntity);
        });

        test('should throw 404 error if not found', async () => {
            DynamoDbAdapter.prototype.getItemByPrimaryKey.mockResolvedValue(null);
            await expect(userService.getUserById('000')).rejects.toThrow('User not found');
        });
    });

    // 3. GET ALL USERS
    describe('getAllUsers', () => {
        test('should return all users mapped to entities', async () => {
            DynamoDbAdapter.prototype.getAllBySkPrefix.mockResolvedValue([validUserData]);
            const result = await userService.getAllUsers();
            expect(result[0]).toBeInstanceOf(UserEntity);
            expect(result).toHaveLength(1);
        });
    });

    // 4. GET USER BY NAME
    describe('getUserByName', () => {
        test('should return a list of users matching name', async () => {
            DynamoDbAdapter.prototype.getByName.mockResolvedValue([validUserData]);
            const result = await userService.getUserByName('Kevin');
            expect(result[0].name).toContain('Kevin');
        });

        test('should throw error if no users found', async () => {
            DynamoDbAdapter.prototype.getByName.mockResolvedValue([]);
            await expect(userService.getUserByName('Unknown'))
                .rejects.toThrow('No users found containing the name: Unknown');
        });
    });

    // 5. UPDATE USER
    describe('updateUser', () => {
        test('should update user successfully', async () => {
            DynamoDbAdapter.prototype.getItemByPrimaryKey.mockResolvedValue(validUserData);
            DynamoDbAdapter.prototype.updateItem.mockResolvedValue({ ...validUserData, name: 'Updated' });

            const result = await userService.updateUser('1037650134', { name: 'Updated' });
            expect(result.name).toBe('Updated');
        });
    });

    // 6. DELETE USER
    describe('deleteUser', () => {
        test('should delete user if exists', async () => {
            DynamoDbAdapter.prototype.getItemByPrimaryKey.mockResolvedValue(validUserData);
            DynamoDbAdapter.prototype.deleteItem.mockResolvedValue({ deleted: true });

            const result = await userService.deleteUser('1037650134');
            expect(result.deleted).toBe(true);
        });
    });

    // 7. VALIDATE USER BALANCE
    describe('validateUserBalance', () => {
        test('should calculate new balance if subscription is possible', async () => {
            const user = new UserEntity(validUserData);
            const result = await userService.validateUserBalance(user, 100000);
            expect(result).toBe(400000);
        });
    });

    // 8. GET USER HISTORY
    describe('getUserHistory', () => {
        test('should return history with formatted transaction IDs', async () => {
            const mockHistory = [{ pk: 'USER#1', sk: 'HISTORY#ABC-123', type: 'OPEN' }];
            DynamoDbAdapter.prototype.getHistoryByPk.mockResolvedValue(mockHistory);

            const result = await userService.getUserHistory('1');
            expect(result[0].idTransaction).toBe('ABC-123');
        });
    });

    // 9. GET USER BY CONTACT
    describe('getUserByContact', () => {
        test('should find user by phone', async () => {
            DynamoDbAdapter.prototype.getByAttribute.mockResolvedValue(validUserData);
            const result = await userService.getUserByContact('phone', '300123');
            expect(result.id).toBe('1037650134');
        });

        test('should throw error for invalid contact type', async () => {
            await expect(userService.getUserByContact('address', 'calle 10'))
                .rejects.toThrow('Invalid contact type, only PHONE or EMAIL');
        });
    });
});