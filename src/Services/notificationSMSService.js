const twilio = require('twilio');

module.exports = class NotificationSMSService {
    constructor() {
        this.client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
        this.messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
    }

    async send(phone, userName, fundName, type, currentBalance) {
        const isSubscription = type === 'SUBSCRIPTION';

        const formattedBalance = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(currentBalance);

        const action = isSubscription ? 'vinculacion' : 'cancelacion';
        const message = `BTG Pactual: Hola ${userName}, ${action} exitosa al fondo ${fundName}. Nuevo saldo: ${formattedBalance}.`;

        try {
            const response = await this.client.messages.create({
                body: message,
                messagingServiceSid: this.messagingServiceSid,
                to: phone
            });

            return { success: true, sid: response.sid };
        } catch (err) {
            console.error('[TWILIO ERROR]:', err.message);
        }
    }
};