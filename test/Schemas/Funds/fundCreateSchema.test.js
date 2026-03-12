const fundCreateSchema = require('#schemas/funds/fundCreateSchema.js');
const Ajv = require('ajv');

describe('Schema: fundCreateSchema', () => {
    let ajv;
    let validate;

    beforeAll(() => {
        ajv = new Ajv({ allErrors: true });
        validate = ajv.compile(fundCreateSchema);
    });

    test('should validate a correct fund object', () => {
        const validData = {
            pk: 'FUND#FP_VISTA',
            name: 'Fondo de Inversión Vista',
            minimumAmount: 75000,
            category: 'FIC'
        };
        const isValid = validate(validData);
        expect(isValid).toBe(true);
    });

    test('should fail if pk does not start with FUND#', () => {
        const invalidData = {
            pk: 'VISTA_123',
            name: 'Fondo Vista',
            minimumAmount: 75000,
            category: 'FIC'
        };
        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors[0].keyword).toBe('pattern');
    });

    test('should fail if name is too short', () => {
        const invalidData = {
            pk: 'FUND#TEST',
            name: 'Ab',
            minimumAmount: 1000,
            category: 'FPV'
        };
        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors[0].message).toContain('must NOT have fewer than 3 characters');
    });

    test('should fail if minimumAmount is less than 1', () => {
        const invalidData = {
            pk: 'FUND#TEST',
            name: 'Fondo Test',
            minimumAmount: 0,
            category: 'FPV'
        };
        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors[0].message).toContain('must be >= 1');
    });

    test('should fail if category is not FPV or FIC', () => {
        const invalidData = {
            pk: 'FUND#TEST',
            name: 'Fondo Test',
            minimumAmount: 50000,
            category: 'OTRO'
        };
        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors[0].message).toContain('must be equal to one of the allowed values');
    });
});