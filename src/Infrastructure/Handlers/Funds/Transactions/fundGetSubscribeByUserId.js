const FundService = require('#services/fundService.js');
const { ok, badRequest, serverError } = require('#utils/httpResponse.js');

const fundGetSubscribeByUserIdHandler = async (req, res) => {
    const path = req.originalUrl;
    try {
        const { userId } = req.params;

        if (!userId) return badRequest(res, new Error("userId is required"), path);

        const fundService = new FundService();
        const subscriptions = await fundService.getSubscriptionsByUserId(userId);

        return ok(res, subscriptions);
    } catch (error) {
        if (error.message.includes('Subscription not found')) {
            return badRequest(res, error, path);
        }

        console.error('Error en fundGetSubscribeByUserIdHandler:', error);
        return serverError(res, error.message, path);
    }
};

module.exports = fundGetSubscribeByUserIdHandler;