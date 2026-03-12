const FundService = require('#services/fundService.js');
const { ok, serverError } = require('#utils/httpResponse.js');

module.exports = async (req, res) => {
    const path = req.originalUrl;
    try {
        const fundService = new FundService();
        const result = await fundService.getAllFunds();
        return ok(res, result);
    } catch (error) {
        return serverError(res, path);
    }
};
