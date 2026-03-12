const NotificationSMSService = require('#services/notificationSMSService.js');

jest.mock('twilio', () => {
    const mockCreate = jest.fn();
    const mockTwilio = jest.fn(() => ({
        messages: {
            create: mockCreate
        }
    }));
    return mockTwilio;
});

describe('Service: NotificationSMSService', () => {
    let smsService;
    let twilioMockInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.TWILIO_MESSAGING_SERVICE_SID = 'MG123';
        smsService = new NotificationSMSService();
        twilioMockInstance = smsService.client;
    });

    test('should send correct SMS body for SUBSCRIPTION', async () => {
        twilioMockInstance.messages.create.mockResolvedValue({ sid: 'SM123' });

        const result = await smsService.send(
            '+573001234567',
            'Kevin',
            'Fondo Dinamico',
            'SUBSCRIPTION',
            425000
        );

        expect(twilioMockInstance.messages.create).toHaveBeenCalledWith({
            messagingServiceSid: 'MG123',
            to: '+573001234567',
            body: expect.stringMatching(/vinculacion exitosa al fondo Fondo Dinamico\. Nuevo saldo: \$\s?425\.000/)
        });
        expect(result.success).toBe(true);
    });

    test('should send correct SMS body for UNSUBSCRIBE', async () => {
        twilioMockInstance.messages.create.mockResolvedValue({ sid: 'SM456' });

        await smsService.send(
            '+573001234567',
            'Kevin',
            'Fondo Dinamico',
            'UNSUBSCRIBE',
            500000
        );

        expect(twilioMockInstance.messages.create).toHaveBeenCalledWith(
            expect.objectContaining({
                body: expect.stringContaining('cancelacion exitosa')
            })
        );
    });

    test('should log error if Twilio fails', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        twilioMockInstance.messages.create.mockRejectedValue(new Error('Twilio Auth Error'));

        await smsService.send('123', 'U', 'F', 'SUBSCRIPTION', 0);

        expect(consoleSpy).toHaveBeenCalledWith('[TWILIO ERROR]:', 'Twilio Auth Error');
        consoleSpy.mockRestore();
    });
});