const FundService = require('#services/fundService.js');
const { ok, badRequest } = require('#utils/httpResponse.js');

module.exports = async (req, res) => {
    const path = req.originalUrl;
    
    try {
        const { userId, fundId } = req.body;

        if (!userId || !fundId) return badRequest(res, { message: 'Missing user id or fund id param' }, path);

        const fundService = new FundService();
        const result = await fundService.unsubscribeFromFund(userId, fundId);
        return ok(res, result);
    } catch (error) {
        return badRequest(res, error, path);
    }
};
