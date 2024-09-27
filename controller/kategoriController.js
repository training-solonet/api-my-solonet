import Kategori from "../models/Kategori.js";

export const kategori = async (req, res) => {
  try {
      const response = await Kategori.findAll({
        attributes: ["nama", "keterangan"],
      });

      res.status(200).json(response);
  } catch (error) {
      console.log(error.message);
  }
}


