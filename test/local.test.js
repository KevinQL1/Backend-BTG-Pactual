const app = require('#infrastructure/server.js');

jest.mock('#infrastructure/server.js', () => ({
    listen: jest.fn((port, callback) => {
        if (callback) callback();
        return { close: jest.fn() };
    })
}));

describe('Local.js Entry Point', () => {
    let consoleSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
        consoleSpy.mockRestore();
        delete process.env.PORT;
        delete process.env.DYNAMODB_TABLE;
    });

    test('should start the server on the default port 3000 if no env var is set', () => {
        jest.isolateModules(() => {
            require('../src/local.js');
        });

        expect(app.listen).toHaveBeenCalledWith(3000, expect.any(Function));
    });

    test('should start the server on a custom port from environment variables', () => {
        process.env.PORT = '8111';

        jest.isolateModules(() => {
            require('#src/local.js');
        });

        expect(app.listen).toHaveBeenCalledWith('8111', expect.any(Function));
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('http://localhost:8111'));
    });

    test('should display the database table name in the console', () => {
        process.env.DYNAMODB_TABLE = 'BTG_Pactual_Table';

        jest.isolateModules(() => {
            require('../src/local.js');
        });

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('✅ Base de Datos: BTG_Pactual_Table'));
    });
});
