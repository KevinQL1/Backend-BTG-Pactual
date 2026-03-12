const UserService = require('#services/userService.js');
const { ok, badRequest, conflict } = require('#utils/httpResponse.js');

module.exports = async (req, res) => {
    const path = req.originalUrl;

    try {
        const userService = new UserService();
        const result = await userService.createUser(req.body);
        return ok(res, result);
    } catch (error) {
        return badRequest(res, error, path);
    }
};