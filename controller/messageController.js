import whatsappClient from "../controller/wwebController.js";

export const postMessage = async (req, res) => {
    try {
        // validate ip
        if (req.ip !== '::1' && req.ip !== '127.0.0.1' && req.ip !== '175.106.17.180' && req.ip !== '::ffff:127.0.0.1') {
            console.log("Unauthorized access attempt from IP:", req.ip);
            return res.status(403).json({ message: "Forbidden" });
        }
        
        const { to, message } = req.body;

        if (!to || !message) {
            return res.status(400).json({ message: "Nomor tujuan dan pesan harus diisi" });
        }

        await whatsappClient.sendMessage(to, message);
        return res.status(200).json({ message: "Pesan berhasil dikirim" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan saat mengirim pesan" });
    }
};
