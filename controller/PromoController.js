import Promo from "../models/Promo.js";

export const getPromo = async (req, res) => {
  try {
    const response = await Promo.findAll({
      attributes: ["id", "id_product", "durasi_berawal", "durasi_berakhir"],
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
  }
};
