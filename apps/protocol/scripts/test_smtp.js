
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.resend.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: 'resend',
        pass: 're_BmuHST9L_AagkbNYVBwaCjRiRWxr4Dfc7',
    },
});

async function main() {
    try {
        const info = await transporter.sendMail({
            from: '"Veritas Test" <ali@pulsoconnect.es>',
            to: 'jesuspuentedavila@gmail.com',
            subject: 'Prueba SMTP Veritas',
            text: 'Si recibes esto, el SMTP está configurado correctamente.',
        });
        console.log('Mensaje enviado: %s', info.messageId);
    } catch (error) {
        console.error('Error enviando mail:', error);
    }
}

main();
