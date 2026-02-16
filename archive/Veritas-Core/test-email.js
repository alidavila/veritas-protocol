
const nodemailer = require('nodemailer');

const GMAIL_USER = 'jesusalidavila1989@gmail.com';
const GMAIL_APP_PASSWORD = 'ubav dayb gxbi aaxn';

async function main() {
  console.log("📨 Intentando enviar desde:", GMAIL_USER);
  
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });

  try {
    let info = await transporter.sendMail({
      from: `"OpenClaw Agent" <${GMAIL_USER}>`,
      to: GMAIL_USER,
      subject: "🧪 Prueba de Conexión Veritas",
      text: "Hola Ali! Soy Claw. Si lees esto, ya tengo el control de tu Gmail para empezar el Email Marketing de Veritas. Venceremos!",
    });

    console.log("✅ Email enviado con éxito: %s", info.messageId);
  } catch (error) {
    console.error("❌ Error al enviar email:", error);
  }
}

main();
