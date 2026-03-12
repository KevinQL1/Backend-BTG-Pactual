const NotificationEmailService = require('#services/notificationEmailService.js');

jest.mock('resend', () => {
    return {
        Resend: jest.fn().mockImplementation(() => ({
            emails: {
                send: jest.fn()
            }
        }))
    };
});

describe('Service: NotificationEmailService', () => {
    let emailService;
    let resendMockInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        emailService = new NotificationEmailService();
        resendMockInstance = emailService.resend;
    });

    test('should call Resend with correct data for SUBSCRIPTION', async () => {
        resendMockInstance.emails.send.mockResolvedValue({ data: { id: '123' }, error: null });

        await emailService.send(
            'kevin@test.com',
            'Kevin',
            'Fondo Dinámico',
            'SUBSCRIPTION',
            425000
        );

        expect(resendMockInstance.emails.send).toHaveBeenCalledWith(
            expect.objectContaining({
                to: ['kevin@test.com'],
                subject: 'Confirmación de Vinculación - BTG Pactual',
                html: expect.stringMatching(/\$\s?425\.000/)
            })
        );

        expect(resendMockInstance.emails.send).toHaveBeenCalledWith(
            expect.objectContaining({
                html: expect.stringContaining('¡Hola Kevin!')
            })
        );
    });

    test('should call Resend with correct data for UNSUBSCRIBE', async () => {
        resendMockInstance.emails.send.mockResolvedValue({ data: { id: '456' }, error: null });

        await emailService.send(
            'kevin@test.com',
            'Kevin',
            'Fondo Dinámico',
            'UNSUBSCRIBE',
            500000
        );

        expect(resendMockInstance.emails.send).toHaveBeenCalledWith(
            expect.objectContaining({
                subject: 'Confirmación de Cancelación - BTG Pactual',
                html: expect.stringContaining('desvinculación exitosa')
            })
        );
    });

    test('should log error if Resend return an error object', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        resendMockInstance.emails.send.mockResolvedValue({
            data: null,
            error: { message: 'API Error' }
        });

        await emailService.send('a@a.com', 'U', 'F', 'SUBSCRIPTION', 100);

        expect(consoleSpy).toHaveBeenCalledWith('[RESEND ERROR]:', expect.anything());
        consoleSpy.mockRestore();
    });
});