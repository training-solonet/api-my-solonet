import whatsapp from "whatsapp-web.js";
import MemoryChat from "../models/memory_chat.js";
const { Client, LocalAuth } = whatsapp;
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

import qrcode from "qrcode-terminal";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const whatsappClient = new Client({
    authStrategy: new LocalAuth(),
});

whatsappClient.on('qr', (qr) => {
    console.log('QR Code diterima. Silakan pindai menggunakan aplikasi WhatsApp.');
    qrcode.generate(qr, { small: true });
});

whatsappClient.on("ready", async () => {
    console.log("API MY SOLONET IS READY");
});

whatsappClient.on("message", async (msg) => {
    const chat = await msg.getChat();

      if (chat.id.user === '6287812952426') {

        console.log("Pesan diterima dari nomor yang ditentukan:", msg.body);

        // ambil memory chat berdasarkan nomor telepon
        const memoryChat = await MemoryChat.findAll({
            where: {
                from: chat.id.user
            },
            order: [['created_at', 'DESC']],
            limit: 10
        });

        // post ke virtual agent
        try {
          const userPrompt = msg.body;

          const base_system_message = { 
            role: "system", 
            content: "Kamu adalah seorang customer service profesional pada perusahaan bernama solonet yang bergerak pada industri telekomunikasi, di solonet menerima program pkl atau magang untuk sekolah dan universitas, syarat untuk siswa pkl antara lain : wajib memiliki laptop sendiri, membayar biaya 250ribu dan membuat cv. di solonet siswa pkl dibagi menjadi 2 bagian, yaitu pemrograman dan jaringan, akan ada proses wawancara untuk seleksi, sekarang kamu sebagai customer service yang akan fokus merespon pertanyaan chat whatsapp dari calon siswa pkl, jelaskan secara profesional dan ramah pastikan bisa terrender pada whatsapp, cukup respon chat seperlunya dan tidak terlalu panjang, jangan sampai terlihat bahwa chatbot atau ai, respon se natural mungkin seperti customer service profesional, tanyakan informasi penting seperti nama, asal sekolah, berapa lama periode magang atau pkl, serta memilih pemrograman atau jaringan, hindari penggunaan emotikon atau simbol yang tidak perlu" 
          };

          const messages = [
            base_system_message,
            ...memoryChat.map(chat => ({
                role: chat.from === chat.id.user ? "user" : "assistant",
                content: chat.from === chat.id.user ? chat.user : chat.assistant
            })),
            { role: "user", content: userPrompt }
          ];

          const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
              model: 'deepseek/deepseek-chat-v3-0324:free',
              messages: messages
            },
            {
              headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
              }
            }
          );
    
          const reply = response.data.choices[0].message.content;

          console.log("Balasan dari OpenRouter:", reply);
    
          // respon ke whatsapp
          await whatsappClient.sendMessage(chat.id._serialized, reply);

          // simpan ke memory chat
          await MemoryChat.create({
            from: chat.id.user,
            user: userPrompt,
            assistant: reply
          });

        } catch (err) {
          console.error(err.response?.data || err.message);
          res.status(500).json({ error: 'Gagal memanggil OpenRouter API' });
        }
      }
});

whatsappClient.on('disconnected', (reason) => {
    console.log('Klien terputus', reason);
    whatsappClient.initialize();
});

export default whatsappClient;
