const FundService = require('#services/fundService.js');
const { ok, notFound, badRequest } = require('#utils/httpResponse.js');

module.exports = async (req, res) => {
    const path = req.originalUrl;

    try {
        const { userId, transactionId } = req.params;

        if (!userId || !transactionId) return badRequest(res, { message: 'Missing user id or transtion id param' }, path);

        const fundService = new FundService();
        const result = await fundService.getTransactionById(userId, transactionId);
        return ok(res, result);
    } catch (error) {
        return notFound(res, error, path);
    }
};