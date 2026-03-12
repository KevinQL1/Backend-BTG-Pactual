module.exports = {
    type: 'object',
    required: ['pk', 'name', 'minimumAmount', 'category'],
    properties: {
        pk: { type: 'string', pattern: '^FUND#' },
        name: { type: 'string', minLength: 3 },
        minimumAmount: { type: 'number', minimum: 1 },
        category: { type: 'string', enum: ['FPV', 'FIC'] }
    },
    additionalProperties: false
};
