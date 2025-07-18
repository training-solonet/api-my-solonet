import express from "express";
import {
  login,
  register,
  getUserById,
  updateUser,
  sendOtp,
  verifyOtp,
  resetPasswordRequest,
  resetPassword,
  googleSignIn,
  changeProfile,
} from "../controller/UserController.js";
import { verifyToken } from "./middleware/middleware.js";
import {
  addAddress,
  addCustomer,
  getCustomer,
  getKabupatenByProvinsi,
  getKecamatanByKabupaten,
  getKelurahanByKecamatan,
  getProvinsi,
  userNearKantorLocation,
  hubunggkanAccount
} from "../controller/customerController.js";
import { banner } from "../controller/bannerController.js";
import { paket } from "../controller/productController.js";
import { tagihanUser } from "../controller/tagihanController.js";
import { faq } from "../controller/faqController.js";
import {
  bniApi,
  BniInquiry,
  briApi,
  checkPembayaranBriva,
} from "../controller/virtualAccountController.js";
import { detailTagihan } from "../controller/detailTagihanController.js";
import { coverage2km, getKoordinatBts } from "../controller/mapController.js";
import { postMessage } from "../controller/messageController.js";

const router = express.Router();

// User
router.get("/users/:id", verifyToken, getUserById);
router.post("/register", register);
router.post("/login", login);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/request-otp", resetPasswordRequest);
router.post("/reset-password", resetPassword);
router.put("/updateUser/:id", verifyToken, updateUser);
router.put("/change-profile", verifyToken, changeProfile);
router.post("/google", googleSignIn);

// Customer
router.get("/customer", verifyToken, getCustomer);
router.post("/customer", addCustomer);
router.post("/add-address", verifyToken, addAddress);
router.get("/provinsi", verifyToken, getProvinsi);
router.get("/kabupaten/:provinsi_id", verifyToken, getKabupatenByProvinsi);
router.get("/kecamatan/:kabupaten_id", verifyToken, getKecamatanByKabupaten);
router.get("/kelurahan/:kecamatan_id", verifyToken, getKelurahanByKecamatan);
router.post("/nearLocation", userNearKantorLocation);
router.get("/bts-location", getKoordinatBts)
router.post("/coverage-bts", coverage2km);
router.post("/hubungkan-account", verifyToken, hubunggkanAccount);

// Product
router.get("/paket", paket);
router.get("/tagihan-user", verifyToken, tagihanUser);
router.get("/detail-tagihan/:tagihan_id", verifyToken, detailTagihan);

// Banner
router.get("/banner", banner);

// FAQ
router.get("/faq", faq);

//transaksi
router.post("/bni", verifyToken, bniApi);
router.post("/bni-inquiry", verifyToken, BniInquiry);
router.post("/bri", verifyToken, briApi);
router.post("/bri-inquiry", verifyToken, checkPembayaranBriva);
router.get("/detail-tagihan/:tagihan_id", verifyToken, detailTagihan);

// Message
router.post("/message", postMessage);

export default router;
