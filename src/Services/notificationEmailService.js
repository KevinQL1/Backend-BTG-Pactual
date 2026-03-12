const { Resend } = require('resend');

module.exports = class NotificationEmailService {
    constructor() {
        this.resend = new Resend(process.env.RESEND_API_KEY);
    }

    async send(userEmail, userName, fundName, type, currentBalance) {
        const isSubscription = type === 'SUBSCRIPTION';

        const formattedBalance = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(currentBalance);

        const subject = isSubscription
            ? 'Confirmación de Vinculación - BTG Pactual'
            : 'Confirmación de Cancelación - BTG Pactual';

        const message = isSubscription
            ? `Te confirmamos la vinculación exitosa al fondo: <strong>${fundName}</strong>.`
            : `Te confirmamos la desvinculación exitosa del fondo: <strong>${fundName}</strong>. El dinero ha sido retornado a tu cuenta.`;

        try {
            const { data, error } = await this.resend.emails.send({
                from: 'BTG Pactual <onboarding@resend.dev>',
                to: [userEmail],
                subject: subject,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px; max-width: 600px;">
                        <h2 style="color: #003366; border-bottom: 2px solid #003366; padding-bottom: 10px;">¡Hola ${userName}!</h2>
                        <p style="font-size: 16px;">${message}</p>
                        
                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
                            <span style="display: block; color: #666; font-size: 14px;">Tu nuevo saldo disponible es:</span>
                            <strong style="font-size: 24px; color: #003366;">${formattedBalance}</strong>
                        </div>

                        <p>Gracias por utilizar nuestros servicios financieros.</p>
                        <br>
                        <p style="font-size: 0.9em; color: #777; border-top: 1px solid #eee; padding-top: 15px;">
                            Atentamente,<br>
                            <strong>Equipo Digital BTG Pactual</strong>
                        </p>
                    </div>
                `
            });

            if (error) return console.error('[RESEND ERROR]:', error);
        } catch (err) {
            console.error('[NOTIFICATION SERVICE ERROR]:', err);
        }
    }
};