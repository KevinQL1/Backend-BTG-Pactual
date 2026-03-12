const FundService = require('#services/fundService.js');
const { ok, badRequest } = require('#utils/httpResponse.js');

module.exports = async (req, res) => {
    const path = req.originalUrl;
    
    try {
        const fundService = new FundService();
        const result = await fundService.createFund(req.body);
        return ok(res, result);
    } catch (error) {
        return badRequest(res, error, path);
    }
};
