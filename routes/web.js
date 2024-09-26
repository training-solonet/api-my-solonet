import express from "express";
import { product, productById } from '../controller/ProductController.js';
import { getPromo } from '../controller/PromoController.js';
import { kategori }  from '../controller/kategoriController.js';
import { login, register, getUser, updateUser } from "../controller/UserController.js";


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

export default router;
