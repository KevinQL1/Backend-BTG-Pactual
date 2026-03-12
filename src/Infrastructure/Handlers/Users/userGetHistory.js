const UserService = require('#services/userService.js');
const { ok, serverError, notFound, badRequest } = require('#utils/httpResponse.js');

module.exports = async (req, res) => {
    const path = req.originalUrl;

    try {
        const { userId } = req.params;

        if (!userId) return badRequest(res, { message: 'Missing user id param' }, path);

        const userService = new UserService();
        const result = await userService.getUserHistory(userId);
        return ok(res, result);
    } catch (error) {
        if (error.message.includes('not found')) {
            return notFound(res, error, path);
        }

        return serverError(res, path);
    }
};