const UserService = require('#services/userService.js');
const { ok, notFound, badRequest } = require('#utils/httpResponse.js');

module.exports = async (req, res) => {
    const path = req.originalUrl;
    
    try {
        const { name } = req.query;

        if (!name) return badRequest(res, { message: 'Missing name param' }, path);

        const userService = new UserService();
        const result = await userService.getUserByName(name);
        return ok(res, result);
    } catch (error) {
        return notFound(res, error, req.originalUrl);
    }
};