module.exports = {
    type: 'object',
    required: ['userId', 'fundId'],
    properties: {
        userId: { type: 'string', minLength: 1 },
        fundId: { type: 'string', minLength: 1 }
    },
    additionalProperties: false
};