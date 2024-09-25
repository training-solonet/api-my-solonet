import Barang from "../models/Product.js";
import Det_product from "../models/Det_product.js";

export const product = async (req, res) => {
  try {
    const response = await Barang.findAll({
      attributes: [
        "id",
        "kode",
        "nama",
        "id_satuan",
        "id_kategori",
        "harga_jual",
        "durasi",
        "stok",
        "gambar",
      ],
      include: {
        model: Det_product,
        as: "detail_product",
        required: false,
        attributes: ['syarat', 'ketentuan', 'deskripsi'] 
      },
    });

    const Fresponse = response.map(item => {
      const detail = item.detail_product.length > 0 ? item.detail_product[0] : {}; // Ambil detail pertama jika ada
      return {
          id: item.id,
          kode: item.kode,
          nama: item.nama,
          id_satuan: item.id_satuan,
          id_kategori: item.id_kategori,
          harga_jual: item.harga_jual,
          durasi: item.durasi,
          stok: item.stok,
          gambar: item.gambar,
          syarat: detail.syarat || null,
          ketentuan: detail.ketentuan || null,
          deskripsi: detail.deskripsi || null,
      };
  });

    res.status(200).json({
      status: "success",
      message: "Data barang berhasil diambil",
      data: Fresponse,
    });
  } catch (error) {
    console.log(error.message);
  }
};
