import Pembayaran from "../models/pembayaran.js";
import Tagihan from "../models/tagihan.js";


export const detailTagihan = async (req, res) => {
    try {
        const { tagihan_id } = req.params;
    
        const tagihan = await Tagihan.findOne({
        where: {
            id: tagihan_id,
        }, 
        });
    
        if (!tagihan) {
        return res.status(404).json({ message: "Tagihan tidak ditemukan" });
        }
    
        const pembayaran = await Pembayaran.findAll({
        where: {
            tagihan_id: tagihan_id,
        },
        });
    
        return res.status(200).json({ tagihan, pembayaran });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};