import bcrypt from "bcryptjs";
import User from "../models/User.js";
import twilio from "twilio";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";

export const register = async(req, res) =>{

    const { name, phone_number, email, alamat, password, confirm_password } = req.body;

    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    if (password !== confirm_password) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    try {
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(400).json({ message: "Email is already in use" });
        }

        const existingPhoneNumber = await User.findOne({ where: { phone_number } });
        if (existingPhoneNumber) {
            return res.status(400).json({ message: "Phone number is already in use" });
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            name, 
            phone_number,
            email, 
            alamat,
            password: hashedPassword,
        })

        return res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const login = async(req, res) => {
    const { name, email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email, name } });

        if(!user){
            return res.status(404).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        return res.status(200).json({ message: "Login successful ", user: user.name });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getUser = async(req, res) => {
    try {
        const response = await User.findAll();
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}