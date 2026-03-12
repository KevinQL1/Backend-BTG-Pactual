const fundUpdateSchema = require('#schemas/funds/fundUpdateSchema.js');
const Ajv = require('ajv');

describe('Schema: fundUpdateSchema', () => {
    let ajv;
    let validate;

    beforeAll(() => {
        ajv = new Ajv({ allErrors: true });
        validate = ajv.compile(fundUpdateSchema);
    });

    test('should validate when updating only the name', () => {
        const validData = { name: 'Fondo Vista Premium' };
        const isValid = validate(validData);
        expect(isValid).toBe(true);
    });

    test('should validate when updating multiple fields', () => {
        const validData = {
            minimumAmount: 100000,
            category: 'FPV'
        };
        const isValid = validate(validData);
        expect(isValid).toBe(true);
    });

    test('should fail if the object is empty (minProperties: 1)', () => {
        const invalidData = {};
        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors[0].message).toContain('must NOT have fewer than 1 properties');
    });

    test('should fail if minimumAmount is invalid', () => {
        const invalidData = { minimumAmount: 0 };
        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors[0].message).toContain('must be >= 1');
    });

    test('should fail if an unknown property is sent', () => {
        const invalidData = { name: 'Nuevo Fondo', unknown: 'not allowed' };
        const isValid = validate(invalidData);
        expect(isValid).toBe(false);
        expect(validate.errors[0].message).toContain('must NOT have additional properties');
    });
});