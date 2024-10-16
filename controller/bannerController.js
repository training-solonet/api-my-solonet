import Banner from "../models/banner.js";

export const banner = async (req, res) => {
    try {
        const banner = await Banner.findAll({
            attributes: ["judul", "deskripsi", "gambar"],
        });
        res.status(200).json(banner);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}