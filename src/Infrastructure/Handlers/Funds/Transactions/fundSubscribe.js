const FundService = require('#services/fundService.js');
const { ok, badRequest, notFound } = require('#utils/httpResponse.js');

module.exports = async (req, res, next) => {
    const path = req.originalUrl;
    
    try {
        const { userId, fundId } = req.body;

        if (!userId || !fundId) return badRequest(res, { message: 'Missing user id or fund id param' }, path);

        const fundService = new FundService();
        const result = await fundService.subscribeToFund(userId, String(fundId));
        return ok(res, result);
    } catch (error) {
        if (error.message.includes('saldo disponible')) return badRequest(res, error, path);
        if (error.message.includes('not found')) return notFound(res, error, path);
        next(error);
    }
};
