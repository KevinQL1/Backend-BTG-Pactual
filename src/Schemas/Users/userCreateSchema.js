module.exports = {
    type: 'object',
    required: ['pk', 'name', 'balance', 'notificationType'],
    properties: {
        pk: { type: 'string', pattern: '^USER#' },
        name: { type: 'string', minLength: 2 },
        balance: { type: 'number', minimum: 0 },
        notificationType: { type: 'string', enum: ['email', 'sms'] },
        email: { type: 'string', format: 'email' },
        phone: { type: 'string' }
    },
    allOf: [
        {
            if: { properties: { notificationType: { const: 'email' } } },
            then: {
                required: ['email'],
                not: { required: ['phone'] }
            }
        },
        {
            if: { properties: { notificationType: { const: 'sms' } } },
            then: {
                required: ['phone'],
                not: { required: ['email'] }
            }
        }
    ],
    additionalProperties: false
};