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

whatsappClient.on("ready", async () => {
    console.log("Client is ready");

    const chats = await whatsappClient.getChats();

    // Filter hanya grup
    const groups = chats.filter(chat => chat.isGroup);

    // Tampilkan semua nama dan ID grup
    groups.forEach(group => {
        console.log(`📛 Nama Grup: ${group.name}`);
        console.log(`🆔 ID Grup: ${group.id._serialized}`);
        console.log('---');
    });
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
