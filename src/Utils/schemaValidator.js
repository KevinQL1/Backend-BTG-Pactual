const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const ajv = new Ajv({ allErrors: true });
const { badRequest } = require('#utils/httpResponse.js');

addFormats(ajv);

module.exports = (schema) => {
    const validate = ajv.compile(schema);
    return (req, res, next) => {
        const valid = validate(req.body);
        if (!valid) {
            const detail = validate.errors
                .map(err => {
                    const field = err.instancePath.replace('/', '');
                    const type = req.body.notificationType;

                    switch (err.keyword) {
                        case 'not':
                            const forbiddenField = type === 'sms' ? 'email' : 'phone';
                            return `when notificationType is '${type}', the field '${forbiddenField}' must not be present`;

                        case 'required':
                            return `the field '${err.params.missingProperty}' is required for ${type} notifications`;

                        case 'enum':
                            return `${field} must be one of the following values: [${err.params.allowedValues.join(', ')}]`;

                        case 'additionalProperties':
                            return `property '${err.params.additionalProperty}' is not allowed in this schema`;

                        case 'pattern':
                            return `${field} format is invalid`;

                        default:
                            return `${field} ${err.message}`;
                    }
                })
                .filter((msg, index, self) => self.indexOf(msg) === index)
                .join(', ');

            return badRequest(res, new Error(`Validation Error: ${detail}`), req.originalUrl);
        }
        next();
    };
};