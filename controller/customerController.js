import Customer from "../models/customer.js";
import reg_provinces from "../models/provinsi.js";
import reg_regencies from "../models/kabupaten.js";
import reg_districts from "../models/kecamatan.js";
import reg_villages from "../models/kelurahan.js";
import LokasiKantor from "../models/lokasi_kantor.js";
import haversine from "haversine-distance";
import Tagihan from "../models/tagihan.js";
import User from "../models/User.js";
import axios from "axios";
import crypto from "crypto";
import moment from "moment";
import dotenv from "dotenv";
import whatsappClient from "../controller/wwebController.js";

dotenv.config();

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
  const userToken = req.user;
  const userId = userToken.id;

  try {
    const customers = await Customer.findAll({
      where: { user_id: userId },
    });

    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addCustomer = async (req, res) => {
  const { lat, long, bulan, product_id, status_pembayaran } = req.body;

  try {
    const response = await Customer.create(req.body);

    const lati = parseFloat(lat);
    const lon = parseFloat(long);

    if (isNaN(lati) || isNaN(long)) {
      return res
        .status(400)
        .json({ message: "Invalid latitude or longitude values." });
    }

    const geocodeUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lati}&lon=${lon}&format=json`;

    try {
      const locationResponse = await fetch(geocodeUrl, { timeout: 5000 });
      const locationData = await locationResponse.json();

      const tagihan = await Tagihan.create({
        bulan,
        product_id,
        customer_id: response.id,
        status_pembayaran,
      });

      if (locationResponse.ok) {
        res.status(200).json({
          customer: response,
          location: locationData.display_name,
          tagihan: tagihan,
        });
      } else {
        res.status(200).json({
          customer: response,
          location: locationData.error || "Location not found",
          tagihan: tagihan,
        });
      }
    } catch (geocodeError) {
      console.error("Geocode fetch error:", geocodeError);
      const tagihan = await Tagihan.create({
        bulan,
        product_id,
        customer_id: response.id,
        status_pembayaran,
      });

      res.status(200).json({
        customer: response,
        location: "Geocoding service unavailable",
        tagihan: tagihan,
      });
    }

    try {
      const locationResponse = await fetch(geocodeUrl, { timeout: 5000 });
      const locationData = await locationResponse.json();

      if (locationResponse.ok) {
        res.status(200).json({
          customer: response,
          location: locationData.display_name,
        });
      } else {
        res.status(200).json({
          customer: response,
          location: locationData.error || "Location not found",
        });
      }
    } catch (geocodeError) {
      console.error("Geocode fetch error:", geocodeError);
      res.status(200).json({
        customer: response,
        location: "Geocoding service unavailable",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

export const addAddress = async (req, res) => {
  const { nama, nik, provinsi_id, kabupaten_id, kecamatan_id, kelurahan_id, alamat, lat, long } = req.body;
  const UserId = req.user.id;

  try {
    const user = await User.findOne({ where: { id: UserId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const data = {
      user_id: UserId,
      nama, 
      nik,
      provinsi_id,
      kabupaten_id,
      kecamatan_id,
      kelurahan_id,
      alamat,
      lat,
      long,
    };

    await Customer.create(data);

    const lati = parseFloat(lat);
    const lon = parseFloat(long);

    if (isNaN(lati) || isNaN(lon)) {
      return res
        .status(400)
        .json({ message: "Invalid latitude or longitude values." });
    }
   
    return res.status(200).json({ message: "Success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
}

export const userNearKantorLocation = async (req, res) => {
  const { lat, long } = req.body;

  try {
    if (!lat || !long) {
      return res.status(400).json({ message: "Latitude and longitude required" });
    }

    const kantorLocations = await LokasiKantor.findAll();

    const distances = kantorLocations.map(kantor => {
      const userLocation = { lat: lat, lon: long };
      const kantorLocation = { lat: kantor.lat, lon: kantor.long };

      const distance = haversine(userLocation, kantorLocation);

      return {
        name: kantor.nama,
        distance: (distance / 1000).toFixed(2),
        lat: kantor.lat,
        long: kantor.long
      }
    });

    const nearestKantor = distances.sort((a, b) => a.distance - b.distance);

    return res.json(nearestKantor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const hubunggkanAccount = async (req, res) => {
  const { id_pelanggan } = req.body;
  const userId = req.user.id;

  if (!id_pelanggan) {
    return res.status(400).json({ message: "ID Pelanggan required" });
  }

  // check if user has already connected to a customer
  const existingCustomer = await Customer.findOne({ where: { user_id: userId } });
  if (existingCustomer) {
    return res.status(400).json({ message: "User has already connected to a customer" });
  }

  try {
    // check if customer exists in API
    const customer = await axios.post(
      process.env.APP_CORE_URL + "/api/check-pelanggan",
      { id_pelanggan }, 
      {
        headers: {
          "X-Authorization": process.env.APP_CORE_KEY,
        },
      }
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if(req.body.otp){
      const user = await User.findOne({ where: { id: userId } });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.otp !== req.body.otp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      if (moment().tz("Asia/Jakarta").isSameOrAfter(moment(user.otp_expiry).tz("Asia/Jakarta"))) {
        user.otp = null;
        user.otp_expiry = null;
        await user.save();
        return res.status(400).json({ message: "OTP has expired" });
    
      }else{

        if(req.body.hubungkan_account == true){
          Customer.create({
            user_id: userId,
            id_pelanggan: customer.data.id_pelanggan,
            nama: customer.data.nama,
            nik: null,
            provinsi_id: null,
            kabupaten_id: null,
            kecamatan_id: null,
            kelurahan_id: null,
            alamat: customer.data.alamat,
            lat: null,
            long: null,
          });

          user.verified = true;
          user.otp = null;
          user.otp_expiry = null;
          await user.save();

          res.status(200).json({ message: "Proses Hubungkan Akun Berhasil !", customer : customer.data });
        }else{

          res.status(200).json({ message: "OTP verified", customer : customer.data });
        }
      }
    }else{

      // send OTP to customer
      const currentTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
      const otpExpiry = moment(currentTime).add(5, "minutes").toDate();
      const otp = crypto.randomInt(100000, 999999).toString();
  
      const user = await User.findOne({ where: { id: userId } });
      user.otp = otp;
      user.otp_expiry = otpExpiry;
      await user.save();
  
      const phone_number = user.phone_number;
      const maskedPhoneNumber = "x".repeat(user.phone_number.length - 4) + user.phone_number.slice(-4);
  
      const message = `*Kode OTP* : ${otp}. 
  Hati - hati jangan berikan kode ini kepada siapapun. Kode ini akan kadaluarsa dalam 5 menit.`;
        const phoneNumber = `${phone_number}@c.us`;
  
      whatsappClient.sendMessage(phoneNumber, message);
  
      res.status(200).json({ message: "OTP sent. Please verify your number.", phone_number : maskedPhoneNumber, id_pelanggan });

    }

  }catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
