const UserService = require('#services/userService.js');
const { ok, notFound, badRequest } = require('#utils/httpResponse.js');

module.exports = async (req, res) => {
    const path = req.originalUrl;

    try {
        const { type, value } = req.query;

        if (!type || !value) {
            return badRequest(res, new Error("Type (email/phone) and value are required"), path);
        }

        const normalizedType = type.toLowerCase();

        const userService = new UserService();
        const result = await userService.getUserByContact(normalizedType, value);
        return ok(res, result);
    } catch (error) {
        if (error.message.includes('Invalid')) {
            return badRequest(res, error, path);
        }

        return notFound(res, error, path);
    }
};