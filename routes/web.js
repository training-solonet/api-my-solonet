import express from "express";
import { login, register, getUser, verifyOtp } from "../controller/UserController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/users", getUser);
router.post("/verifyOtp", verifyOtp);

export default router;
