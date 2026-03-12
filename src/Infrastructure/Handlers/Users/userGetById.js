const UserService = require('#services/userService.js');
const { ok, notFound, badRequest } = require('#utils/httpResponse.js');

module.exports = async (req, res) => {
    const path = req.originalUrl;
    
    try {
        const { userId } = req.params;

        if(!userId) return badRequest(res, {message: 'Missing user id param'}, path);

        const userService = new UserService();
        const user = await userService.getUserById(userId);
        return ok(res, user);
    } catch (error) {
        return notFound(res, error, path);
    }
};
