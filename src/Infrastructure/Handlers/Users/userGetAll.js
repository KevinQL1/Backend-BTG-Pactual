const UserService = require('#services/userService.js');
const { ok, serverError } = require('#utils/httpResponse.js');

module.exports = async (req, res) => {
    const path = req.originalUrl;

    try {
        const userService = new UserService();
        const result = await userService.getAllUsers();
        return ok(res, result);
    } catch (error) {
        return serverError(res, path);
    }
};
