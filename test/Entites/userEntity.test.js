const UserEntity = require('#entities/userEntity.js');

describe('UserEntity', () => {

    const validBaseData = {
        pk: 'USER#1037650134',
        balance: 500000,
        name: 'Kevin Quintero',
        notificationType: 'email',
        email: 'kevin@test.com'
    };

    test('should create a valid UserEntity and extract ID', () => {
        const user = new UserEntity(validBaseData);
        expect(user.id).toBe('1037650134');
        expect(user.balance).toBe(500000);
    });

    test('should throw error if balance is negative', () => {
        const data = { ...validBaseData, balance: -100 };
        expect(() => new UserEntity(data)).toThrow('Balance cannot be negative');
    });

    test('should throw error if email is missing when notificationType is email', () => {
        const data = { ...validBaseData, notificationType: 'email', email: undefined };
        expect(() => new UserEntity(data)).toThrow('Email is required when notificationType is email');
    });

    test('should throw error if phone is missing when notificationType is sms', () => {
        const data = { ...validBaseData, notificationType: 'sms', phone: '' };
        delete data.email;
        expect(() => new UserEntity(data)).toThrow('Phone is required when notificationType is sms');
    });

    test('should correctly validate if user can subscribe to a fund', () => {
        const user = new UserEntity(validBaseData);
        expect(user.canSubscribe(75000)).toBe(true);
        expect(user.canSubscribe(600000)).toBe(false);
    });

    test('should calculate new balance correctly after subscription', () => {
        const user = new UserEntity(validBaseData);
        const newBalance = user.getNewBalance(100000);
        expect(newBalance).toBe(400000);
    });
});