const serverless = require('serverless-http');
const app = require('#infrastructure/server.js');

module.exports.handler = serverless(app);