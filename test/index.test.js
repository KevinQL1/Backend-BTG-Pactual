const serverless = require('serverless-http');
const app = require('#infrastructure/server.js');
const index = require('#src/index.js');

jest.mock('serverless-http', () => jest.fn((app) => () => 'mocked-handler'));
jest.mock('#infrastructure/server.js', () => ({}));

describe('Index Entry Point', () => {
    test('should export a handler function', () => {
        expect(index.handler).toBeDefined();
        expect(typeof index.handler).toBe('function');
    });

    test('should initialize serverless-http with the express app', () => {
        expect(serverless).toHaveBeenCalledWith(app);
    });

    test('should return the result of serverless-http as the handler', () => {
        const result = index.handler();
        expect(result).toBe('mocked-handler');
    });
});
