module.exports = {
    type: 'object',
    properties: {
        name: { type: 'string', minLength: 2 },
        balance: { type: 'number', minimum: 0 },
        notificationType: { type: 'string', enum: ['email', 'sms'] },
        email: { type: 'string', format: 'email' },
        phone: { type: 'string', minLength: 7 }
    },
    minProperties: 1,
    allOf: [
        {
            if: {
                properties: { notificationType: { const: 'email' } },
                required: ['notificationType']
            },
            then: {
                required: ['email'],
                not: { required: ['phone'] }
            }
        },
        {
            if: {
                properties: { notificationType: { const: 'sms' } },
                required: ['notificationType']
            },
            then: {
                required: ['phone'],
                not: { required: ['email'] }
            }
        }
    ],
    additionalProperties: false
};