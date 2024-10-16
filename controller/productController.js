import Product from "../models/product.js";

export const paket = async (req, res) => {
    try {
        const product = await Product.findAll({
            attributes: ["nama", "deskripsi", "harga", "gambar", "benefit", "syarat_ketentuan"],
        });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}