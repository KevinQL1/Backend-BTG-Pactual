const UserService = require('#services/userService.js');
const { ok, badRequest, notFound } = require('#utils/httpResponse.js');

module.exports = async (req, res) => {
    const path = req.originalUrl;

    try {
        const { userId } = req.params;

        if (!userId) return badRequest(res, { message: 'Missing user id param' }, path);

        const userService = new UserService();
        const result = await userService.updateUser(userId, req.body);
        return ok(res, result);
    } catch (error) {
        if (error.message.includes('not found')) {
            return notFound(res, error, path);
        }

        return badRequest(res, error, path);
    }
};
