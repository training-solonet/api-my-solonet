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
} from "../controller/customerController.js";
import { banner } from "../controller/bannerController.js";
import { paket } from "../controller/productController.js";
import { tagihanUser } from "../controller/tagihanController.js";
import { faq } from "../controller/faqController.js";

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
router.get("/kabupaten/:provinsi_id", getKabupatenByProvinsi);
router.get("/kecamatan/:kabupaten_id", getKecamatanByKabupaten);
router.get("/kelurahan/:kecamatan_id", getKelurahanByKecamatan);

// Product
router.get("/paket", paket);
router.get("/tagihan-user", verifyToken, tagihanUser);

// Banner
router.get("/banner", banner);

// FAQ
router.get("/faq", faq);

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
