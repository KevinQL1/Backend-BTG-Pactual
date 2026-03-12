const subscriptionSchema = require('#schemas/funds/transactions/subscriptionSchema.js');
const Ajv = require('ajv');

describe('Schema: subscriptionSchema', () => {
    let ajv;
    let validate;

    beforeAll(() => {
        ajv = new Ajv({ allErrors: true });
        validate = ajv.compile(subscriptionSchema);
    });

    test('should validate a correct subscription object', () => {
        const validData = {
            userId: '1037650134',
            fundId: 'FP_VISTA'
        };
        const isValid = validate(validData);
        expect(isValid).toBe(true);
    });

    test('should fail if userId is missing', () => {
        const invalidData = { fundId: 'FP_VISTA' };
        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors[0].message).toContain("must have required property 'userId'");
    });

    test('should fail if fundId is an empty string', () => {
        const invalidData = { userId: '123', fundId: '' };
        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors[0].message).toContain('must NOT have fewer than 1 characters');
    });

    test('should fail if there are additional properties', () => {
        const invalidData = {
            userId: '123',
            fundId: 'FP_VISTA',
            extra: 'not allowed'
        };
        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors[0].message).toContain('must NOT have additional properties');
    });

    test('should fail if userId is not a string', () => {
        const invalidData = { userId: 12345, fundId: 'FP_VISTA' };
        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors[0].type).toBe(undefined);
    });
});