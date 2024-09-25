import express from "express";
import { product  } from '../controller/ProductController.js';
import { login, register, getUser, verifyOtp, updateUser } from "../controller/UserController.js";


const router = express.Router();

router.get("/users", getUser);
router.post("/register", register);
router.post("/login", login);
router.get("/product", product);
router.post("/verifyOtp", verifyOtp);
router.put("/updateUser/:id", updateUser);

export default router;
