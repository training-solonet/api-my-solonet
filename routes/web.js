import express from "express";
import passport from "passport";

import { product, productById } from '../controller/ProductController.js';
import { getPromo } from '../controller/PromoController.js';
import { kategori }  from '../controller/kategoriController.js';
import { login, register, getUser, updateUser } from "../controller/UserController.js";
import { getPembelian } from "../controller/PembelianController.js";

const router = express.Router();

// User
router.get("/users", getUser);
router.post("/register", register);
router.post("/login", login);
// router.post("/verifyOtp", verifyOtp);
router.put("/updateUser/:id", updateUser);

// Product
router.get("/product", product);
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
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/login');  
    }
);

router.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/logout');
    });
});


export default router;
