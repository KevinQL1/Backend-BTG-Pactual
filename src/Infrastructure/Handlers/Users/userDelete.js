const UserService = require('#services/userService.js');
const { ok, serverError, notFound } = require('#utils/httpResponse.js');

module.exports = async (req, res) => {
    const path = req.originalUrl;

    try {
        const { userId } = req.params;
        const userService = new UserService();
        await userService.deleteUser(userId);
        return ok(res, { deleted: true, userId });
    } catch (error) {
        if (error.message.includes('not found')) {
            return notFound(res, error, path);
        }

        return serverError(res, path);
    }
};
