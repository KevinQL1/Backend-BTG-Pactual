const FundService = require('#services/fundService.js');
const { ok, badRequest, notFound } = require('#utils/httpResponse.js');

module.exports = async (req, res) => {
    const path = req.originalUrl;
    
    try {
        const { fundId } = req.params;

        if(!fundId) return badRequest(res, new Error("fundId is required" ), path);

        const fundService = new FundService();
        const result = await fundService.updateFund(fundId, req.body);
        return ok(res, result);
    } catch (error) {
        if (error.message.includes('not found')) {
            return notFound(res, error, path);
        }

        return badRequest(res, error, path);
    }
};
