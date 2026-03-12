const FundService = require('#services/fundService.js');
const { ok, notFound, badRequest } = require('#utils/httpResponse.js');

module.exports = async (req, res) => {
    const path = req.originalUrl;
    
    try {
        const { fundId } = req.params;

        if(!fundId) return badRequest(res, new Error("fundId is required" ), path);

        const fundService = new FundService();
        const result = await fundService.getFundById(fundId);
        return ok(res, result);
    } catch (error) {
        return notFound(res, error, path);
    }
};
