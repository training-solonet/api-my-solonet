import express from "express";
import { login, register, getUser } from "../controller/ApiController.js";
import { product  } from '../controller/ProductController.js';

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/users", getUser);
router.get("/product", product);

export default router;
