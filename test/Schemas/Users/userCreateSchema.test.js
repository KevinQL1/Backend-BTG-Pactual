const userCreateSchema = require('#schemas/users/userCreateSchema.js');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

describe('Schema: userCreateSchema', () => {
    let ajv;
    let validate;

    beforeAll(() => {
        ajv = new Ajv({ allErrors: true, strict: false });
        addFormats(ajv); // Necesario para validar el formato 'email'
        validate = ajv.compile(userCreateSchema);
    });

    test('should validate a correct user with email notification', () => {
        const validData = {
            pk: 'USER#1037650134',
            name: 'Kevin Quintero',
            balance: 500000,
            notificationType: 'email',
            email: 'kevin@test.com'
        };
        const isValid = validate(validData);
        expect(isValid).toBe(true);
    });

    test('should validate a correct user with sms notification', () => {
        const validData = {
            pk: 'USER#1037650134',
            name: 'Kevin Quintero',
            balance: 0,
            notificationType: 'sms',
            phone: '3001234567'
        };
        const isValid = validate(validData);
        expect(isValid).toBe(true);
    });

    test('should fail if notificationType is email but email is missing', () => {
        const invalidData = {
            pk: 'USER#123',
            name: 'Kevin',
            balance: 100,
            notificationType: 'email'
            // falta email
        };
        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
    });

    test('should fail if notificationType is email but phone is provided (logic not)', () => {
        const invalidData = {
            pk: 'USER#123',
            name: 'Kevin',
            balance: 100,
            notificationType: 'email',
            email: 'test@test.com',
            phone: '300123' // No debería estar según tu regla 'not'
        };
        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
    });

    test('should fail if pk does not follow USER# pattern', () => {
        const invalidData = {
            pk: '1037650134', // Falta USER#
            name: 'Kevin',
            balance: 100,
            notificationType: 'sms',
            phone: '300123'
        };
        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors[0].keyword).toBe('pattern');
    });

    test('should fail with negative balance', () => {
        const invalidData = {
            pk: 'USER#1',
            name: 'Kevin',
            balance: -1,
            notificationType: 'sms',
            phone: '300'
        };
        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors[0].message).toContain('must be >= 0');
    });
});
