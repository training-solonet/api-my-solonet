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
        attributes: ["syarat", "ketentuan", "deskripsi"],
      },
    });

    const Fresponse = response.map((item) => {
      const detail =
        item.detail_product.length > 0 ? item.detail_product[0] : {};
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

export const productById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Barang.findByPk(id, {
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
        attributes: ["syarat", "ketentuan", "deskripsi"],
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Product Ga Ada woi" });
    }

    const detail = product.detail_product.length > 0 ? product.detail_product[0] : {};
    const Fresponse = {
      id: product.id,
      kode: product.kode,
      nama: product.nama,
      id_satuan: product.id_satuan,
      id_kategori: product.id_kategori,
      harga_jual: product.harga_jual,
      durasi: product.durasi,
      stok: product.stok,
      gambar: product.gambar,
      syarat: detail.syarat || null,
      ketentuan: detail.ketentuan || null,
      deskripsi: detail.deskripsi || null,
    };

    res.status(200).json({
      status: "success",
      message: "Data barang berhasil diambil",
      data: Fresponse,
    });
  } catch (error) {
    console.log(error.message);
  }
};