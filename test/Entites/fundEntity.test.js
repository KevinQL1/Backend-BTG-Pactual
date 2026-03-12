const FundEntity = require('#entities/fundEntity.js');

describe('FundEntity', () => {

    test('should create a valid FundEntity instance', () => {
        const mockData = {
            pk: 'FUND#FP_VISTA',
            name: 'FONDO DE INVERSION VISTA',
            minimumAmount: 75000,
            category: 'FIC'
        };

        const fund = new FundEntity(mockData);

        expect(fund.internalId).toBe(mockData.pk);
        expect(fund.code).toBe('FP_VISTA');
        expect(fund.name).toBe(mockData.name);
        expect(fund.minimumAmount).toBe(mockData.minimumAmount);
    });

    test('should throw error if pk is missing', () => {
        const invalidData = {
            name: 'Fondo Sin PK',
            minimumAmount: 10000
        };

        expect(() => new FundEntity(invalidData)).toThrow('The database identifier (PK) is required');
    });

    test('should throw error if name is empty', () => {
        const invalidData = {
            pk: 'FUND#123',
            name: '',
            minimumAmount: 10000
        };

        expect(() => new FundEntity(invalidData)).toThrow('The fund name is required');
    });

    test('should throw error if minimumAmount is not a number', () => {
        const invalidData = {
            pk: 'FUND#123',
            name: 'Fondo Test',
            minimumAmount: "75000"
        };

        expect(() => new FundEntity(invalidData)).toThrow('The minimum amount must be a numeric value');
    });

    test('should set code as undefined if pk is not provided but somehow bypasses pk check', () => {
        const fund = { pk: undefined, name: 'Test', minimumAmount: 0 };
        expect(() => new FundEntity(fund)).toThrow();
    });
});