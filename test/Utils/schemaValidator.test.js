const schemaValidator = require('#utils/schemaValidator.js');
const { badRequest } = require('#utils/httpResponse.js');

jest.mock('#utils/httpResponse.js');

describe('Utils: schemaValidator', () => {
    let req, res, next;

    const mockSchema = {
        type: 'object',
        required: ['name', 'notificationType'],
        properties: {
            name: { type: 'string' },
            notificationType: { type: 'string', enum: ['email', 'sms'] },
            email: { type: 'string' }
        },
        allOf: [
            {
                if: { properties: { notificationType: { const: 'email' } } },
                then: { required: ['email'] }
            }
        ],
        additionalProperties: false
    };

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            body: {},
            originalUrl: '/api/test'
        };
        res = {};
        next = jest.fn();
    });

    test('should call next() if data is valid', () => {
        req.body = { name: 'Kevin', notificationType: 'email', email: 'k@t.com' };
        const middleware = schemaValidator(mockSchema);

        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(badRequest).not.toHaveBeenCalled();
    });

    test('should return customized error for missing required field', () => {
        req.body = { name: 'Kevin', notificationType: 'email' };
        const middleware = schemaValidator(mockSchema);

        middleware(req, res, next);

        expect(badRequest).toHaveBeenCalledWith(
            res,
            expect.objectContaining({
                message: expect.stringContaining("the field 'email' is required for email notifications")
            }),
            '/api/test'
        );
    });

    test('should return customized error for invalid enum value', () => {
        req.body = { name: 'Kevin', notificationType: 'push' };
        const middleware = schemaValidator(mockSchema);

        middleware(req, res, next);

        expect(badRequest).toHaveBeenCalledWith(
            res,
            expect.objectContaining({
                message: expect.stringContaining("notificationType must be one of the following values: [email, sms]")
            }),
            '/api/test'
        );
    });

    test('should return customized error for additional properties', () => {
        req.body = { name: 'Kevin', notificationType: 'sms', extra: 'data' };
        const middleware = schemaValidator(mockSchema);

        middleware(req, res, next);

        expect(badRequest).toHaveBeenCalledWith(
            res,
            expect.objectContaining({
                message: expect.stringContaining("property 'extra' is not allowed")
            }),
            '/api/test'
        );
    });
});