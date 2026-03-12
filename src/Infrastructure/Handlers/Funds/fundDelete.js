const FundService = require('#services/fundService.js');
const { ok, serverError, notFound } = require('#utils/httpResponse.js');

module.exports = async (req, res) => {
    const path = req.originalUrl;

    try {
        const { fundId } = req.params;
        
        if(!fundId) return badRequest(res, new Error("fundId is required" ), path);
        
        const fundService = new FundService();
        await fundService.deleteFund(fundId);
        return ok(res, { deleted: true, fundId });
    } catch (error) {
        if (error.message.includes('not found')) {
            return notFound(res, error, path);
        }

        return serverError(res, path);
    }
};
