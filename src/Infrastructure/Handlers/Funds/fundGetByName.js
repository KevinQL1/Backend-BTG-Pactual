const FundService = require('#services/fundService.js');
const { ok, notFound, badRequest } = require('#utils/httpResponse.js');

module.exports = async (req, res) => {
    const path = req.originalUrl;
    
    try {
        const { name } = req.query;

        if(!name) return badRequest(res, new Error("Name query param is required"), path);

        const fundService = new FundService();
        const result = await fundService.getFundByName(name);
        return ok(res, result);
    } catch (error) {
        return notFound(res, error, path);
    }
};
