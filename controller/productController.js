import Product from "../models/product.js";

export const paket = async (req, res) => {
    try {
        const product = await Product.findAll({
            attributes: [
                "nama", 
                "deskripsi", 
                "harga", 
                "gambar", 
                "benefit", 
                "syarat_ketentuan"
            ],
        });

        const formattedProduct = product.map(product => ({
            nama: product.nama,
            deskripsi: product.deskripsi,
            harga: product.harga,
            gambar: product.gambar,
            benefit: JSON.parse(product.benefit), 
            syarat_dan_ketentuan: JSON.parse(product.syarat_ketentuan) 
        }));

        res.status(200).json({
            products: formattedProduct
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}