import express from "express";
import { login, register, getUser } from "../controller/ApiController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/users", getUser);

export default router;
