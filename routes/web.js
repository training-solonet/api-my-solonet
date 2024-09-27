import express from "express";
import { product  } from '../controller/ProductController.js';
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

// Pembelian
router.get("/pembelian", getPembelian);

export default router;
