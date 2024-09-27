import Pembelian from "../models/Pembelian.js";
import detail_pembelian from "../models/Det_pembelian.js";

export const getPembelian = async (req, res) => {
  try {
    const response = await Pembelian.findAll({
      attributes: [
        "no_invoice",
        "virtual_account",
        "tgl_beli",
        "tgl_tempo",
        "ppn",
        "total",
        "status",
        "id_user",
        "product_status",
        "id_transaksi",
      ],
      include: {
        model: detail_pembelian,
        as: "detail_pembelian",
        required: false,
        attributes: ["id_product", "qty", "harga_product"],
      },
    });

    const Fresponse = response.map(item => {
        const detail = item.detail_pembelian.length > 0 ? item.detail_pembelian[0] : {};
        return {
            no_invoice: item.no_invoice,
            virtual_account: item.virtual_account,
            tgl_beli: item.tgl_beli,
            tgl_tempo: item.tgl_tempo,
            ppn: item.ppn,
            total: item.total,
            status: item.status,
            id_user: item.id_user,
            product_status: item.product_status,
            id_transaksi: item.id_transaksi,
            id_product: detail.id_product || null,
            qty: detail.qty || null,
            harga_product: detail.harga_product || null,
        };
    });

    res.status(200).json(Fresponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
