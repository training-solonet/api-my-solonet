import Banner from "../models/banner.js";

export const banner = async (req, res) => {
    try {
        const banner = await Banner.findAll({
            attributes: ["judul", "deskripsi", "gambar"],
        });

        const updateBanner = banner.map(item => ({
            ...item,
            gambar: `http://localhost:5000/images/banner/${item.gambar}`
        }))
        res.status(200).json(updateBanner);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}