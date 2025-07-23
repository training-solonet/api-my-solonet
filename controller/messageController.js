import whatsappClient from "../controller/wwebController.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const postMessage = async (req, res) => {
    try {
        // validate ip
        if (req.ip !== '::1' && req.ip !== '127.0.0.1' && req.ip !== '175.106.17.180' && req.ip !== '::ffff:127.0.0.1') {
            console.log("Unauthorized access attempt from IP:", req.ip);
            return res.status(403).json({ message: "Forbidden" });
        }
        
        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
        const { to, message } = req.body;

        if (!to || !message) {
            return res.status(400).json({ message: "Nomor tujuan dan pesan harus diisi" });
        }

        try {
            const userPrompt = msg.body;

            const base_system_message = {
                role: "system",
                content: "Kamu adalah seorang asisten pribadi pak rico yang membantu me rekap dan memantau absensi siswa pkl atau magang di solonet, pak rico adalah sosok yang galak, tegas, mengamati, berwibawa dan yang pasti galak dan siswa pkl harus berhati - hati kepada pak rico, jam masuk pkl adalah jam 08.00 dan ketika terlambat harus kena tegur"
            };

            const messages = [
                base_system_message,
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

            await whatsappClient.sendMessage(to, reply);
            return res.status(200).json({ message: "Pesan berhasil dikirim" });
        } catch (err) {
            console.error(err.response?.data || err.message);
            return res.status(500).json({ error: 'Gagal memanggil OpenRouter API' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan saat mengirim pesan" });
    }
};
