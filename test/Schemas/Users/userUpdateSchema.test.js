const userUpdateSchema = require('#schemas/users/userUpdateSchema.js');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

describe('Schema: userUpdateSchema', () => {
    let ajv;
    let validate;

    beforeAll(() => {
        ajv = new Ajv({ allErrors: true, strict: false });
        addFormats(ajv);
        validate = ajv.compile(userUpdateSchema);
    });

    test('should validate a simple name update', () => {
        const validData = { name: 'Kevin Q.' };
        const isValid = validate(validData);
        expect(isValid).toBe(true);
    });

    test('should validate switching to email notification', () => {
        const validData = {
            notificationType: 'email',
            email: 'new-email@test.com'
        };
        const isValid = validate(validData);
        expect(isValid).toBe(true);
    });

    test('should fail if switching to sms but phone is missing', () => {
        const invalidData = {
            notificationType: 'sms'
            // Falta el phone
        };
        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
    });

    test('should fail if an empty object is sent (minProperties: 1)', () => {
        const invalidData = {};
        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors[0].message).toContain('must NOT have fewer than 1 properties');
    });

    test('should fail if phone is too short', () => {
        const invalidData = { phone: '123' };
        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors[0].message).toContain('must NOT have fewer than 7 characters');
    });

    test('should fail if additional properties are sent', () => {
        const invalidData = { name: 'Kevin', unexpected: 'data' };
        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
    });
});
