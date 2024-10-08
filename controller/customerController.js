import Customer from "../models/customer.js";
import reg_provinces from "../models/provinsi.js";
import reg_regencies from "../models/kabupaten.js";
import reg_districts from "../models/kecamatan.js";
import reg_villages from "../models/kelurahan.js";

export const getProvinsi = async (req, res) => {
    try {
      const provinsi = await reg_provinces.findAll(); 
      res.json(provinsi);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  export const getKabupatenByProvinsi = async (req, res) => {
    try {
      const { provinsi_id } = req.params; 
      const kabupaten = await reg_regencies.findAll({
        where: { province_id: provinsi_id },
      });
      res.json(kabupaten);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
  };
  
 export const getKecamatanByKabupaten = async (req, res) => {
    try {
      const { kabupaten_id } = req.params; 
      const kecamatan = await reg_districts.findAll({
        where: { regency_id: kabupaten_id }, 
      });
      res.json(kecamatan);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  export const getKelurahanByKecamatan = async (req, res) => {
    try {
      const { kecamatan_id } = req.params; 
      const kelurahan = await reg_villages.findAll({
        where: { district_id: kecamatan_id }, 
      });
      res.json(kelurahan);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


export const getCustomer = async (req, res) => {
    try {
        const response = await Customer.findAll();
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const addCustomer = async (req, res) => {
    try {
        const response = await Customer.create(req.body);
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}