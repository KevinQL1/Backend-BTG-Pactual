module.exports = {
    type: 'object',
    properties: {
        name: { type: 'string', minLength: 3 },
        minimumAmount: { type: 'number', minimum: 1 },
        category: { type: 'string', enum: ['FPV', 'FIC'] }
    },
    minProperties: 1,
    additionalProperties: false
};