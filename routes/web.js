import express from "express";
import passport from "passport";
import {
  login,
  register,
  getUser,
  getUserById,
  updateUser,
  sendOtp,
  verifyOtp,
  resetPasswordRequest,
  resetPassword,
  addPhoneNumber,
  googleSignIn,
} from "../controller/UserController.js";
import { verifyToken } from "./middleware/middleware.js";
import {
  addCustomer,
  getCustomer,
  getKabupatenByProvinsi,
  getKecamatanByKabupaten,
  getKelurahanByKecamatan,
  getProvinsi,
  nearLocationStatis,
  userNearKantorLocation,
} from "../controller/customerController.js";
import { banner } from "../controller/bannerController.js";
import { paket } from "../controller/productController.js";
import { tagihanUser } from "../controller/tagihanController.js";
import { faq } from "../controller/faqController.js";
import whatsappClient from "../controller/wwebController.js";
import {
  bniApi,
  BniInquiry,
  briApi,
  checkPembayaranBriva,
} from "../controller/virtualAccountController.js";
import { detailTagihan } from "../controller/detailTagihanController.js";

const router = express.Router();

// User
router.get("/users", verifyToken, getUser);
router.get("/users/:id", verifyToken, getUserById);
router.post("/register", register);
router.post("/login", login);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/request-otp", resetPasswordRequest);
router.post("/reset-password", resetPassword);
router.put("/updateUser/:id", verifyToken, updateUser);
router.post("/verify-number", addPhoneNumber);
router.post("/google", googleSignIn);

// Customer
router.get("/customer", verifyToken, getCustomer);
router.post("/customer", addCustomer);
router.get("/provinsi", verifyToken, getProvinsi);
router.get("/kabupaten/:provinsi_id", verifyToken, getKabupatenByProvinsi);
router.get("/kecamatan/:kabupaten_id", verifyToken, getKecamatanByKabupaten);
router.get("/kelurahan/:kecamatan_id", verifyToken, getKelurahanByKecamatan);
router.post("/nearLocation", userNearKantorLocation);
router.get("/nearLocationStatis", nearLocationStatis);

// Product
router.get("/paket", paket);
router.get("/tagihan-user", verifyToken, tagihanUser);
router.get("/detail-tagihan/:tagihan_id", detailTagihan);

// Banner
router.get("/banner", banner);

// FAQ
router.get("/faq", faq);

// Whatsapp
router.post("/message", (req, res) => {
  whatsappClient.sendMessage(req.body.phoneNumber, req.body.message);
  res.send();
})

// FAQ
router.get("/faq", faq);

//transaksi
router.post("/bni", verifyToken,bniApi);
router.post("/bni-inquiry", verifyToken, BniInquiry);
router.post("/bri", verifyToken, briApi);
router.post("/bri-inquiry", verifyToken, checkPembayaranBriva);
router.get("/detail-tagihan/:tagihan_id", detailTagihan);

router.post("/message", verifyToken, (req, res) => {
  whatsappClient.sendMessage(req.body.phoneNumber, req.body.message);
  res.send();
});

//google auth
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const { token, user } = req.user;

    if (user.isNewUser) {
      res.redirect("/verify-number");
    } else {
      res.status(200).json({
        message: "Success",
        token,
        user,
      });
    }
  }
);

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/logout");
  });
});

export default router;
