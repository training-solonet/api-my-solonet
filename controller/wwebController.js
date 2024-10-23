import whatsapp from "whatsapp-web.js";
const { Client, LocalAuth } = whatsapp;

import qrcode from "qrcode-terminal";

const whatsappClient = new Client({
    authStrategy: new LocalAuth(),
});

whatsappClient.on('qr', (qr) => {
    console.log('QR Code diterima. Silakan pindai menggunakan aplikasi WhatsApp.');
    qrcode.generate(qr, { small: true });
});

whatsappClient.on("ready", () => {
    console.log("Client is ready");
});

whatsappClient.on("message", async (msg) => {
    try {
        if (msg.from !== "status@broadcast") {
            const contact = await msg.getContact();
            console.log(contact, msg.body);
        }
    } catch (error) {
        if (error.name === "ProtocolError") {
            console.log("ProtocolError: Konteks eksekusi dihancurkan");
        } else {
            console.log(error);
        }
    }
});

whatsappClient.on('disconnected', (reason) => {
    console.log('Klien terputus', reason);
    whatsappClient.initialize();
});

export default whatsappClient;
