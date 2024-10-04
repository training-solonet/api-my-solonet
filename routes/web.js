import express from "express";
import passport from "passport";

import { product, productById } from '../controller/ProductController.js';
import { getPromo } from '../controller/PromoController.js';
import { kategori }  from '../controller/kategoriController.js';
import { login, register, getUser, updateUser, sendOtp, verifyOtp, resetPasswordRequest, resetPassword } from "../controller/UserController.js";
import { getPembelian } from "../controller/PembelianController.js";
import { authenticateJWT } from "./middleware/auth.js";

const router = express.Router();

// User
router.get("/users", authenticateJWT, getUser);
router.post("/register", register);
router.post("/login", login);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/request-otp", resetPasswordRequest);
router.post("/reset-password", resetPassword);
router.put("/updateUser/:id", updateUser);

// Product
router.get("/product", authenticateJWT, product);
router.get("/kategori", kategori);
router.get("/product-promo", getPromo);
router.get("/product/:id", productById );

// Pembelian
router.get("/pembelian", getPembelian);

//google auth
router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/product');  
    }
);

router.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/logout');
    });
});


export default router;
