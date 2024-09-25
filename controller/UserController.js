import bcrypt from "bcryptjs";
import User from "../models/User.js";
import dotenv from "dotenv";
import twilio from "twilio";
import moment from "moment";
import { where } from "sequelize";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export const register = async (req, res) => {
  const { name, phone_number, email, alamat, password, confirm_password } =
    req.body;

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
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
      return res
        .status(400)
        .json({ message: "Phone number is already in use" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otp_expires = moment().add(5, "minutes").toDate();

    await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone_number,
    });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      name,
      phone_number,
      email,
      alamat,
      password: hashedPassword,
      otp,
      otp_expires,
      verified: false,
    });

    console.log(otp);

    return res
      .status(201)
      .json({ message: "User created successfully. OTP sent to your phone." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyOtp = async (req, res) => {
  const { phone_number, otp } = req.body;

  try {
    const cleanedPhoneNumber = phone_number.trim();
    const cleanedOtp = otp.trim();

    const user = await User.findOne({
      where: { phone_number: cleanedPhoneNumber, otp: cleanedOtp },
    });

    if (!user) {
      console.log(
        `Invalid OTP for phone number ${phone_number}: Received OTP ${otp}`
      );
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (moment().isAfter(user.otp_expires)) {
      console.log("OTP expired");
      return res.status(400).json({ message: "OTP has expired" });
    }

    user.verified = true;
    user.otp = null;
    user.otp_expires = null;
    await user.save();

    return res
      .status(200)
      .json({ message: "Phone number verified successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email, name } });

    if (!user) {
      return res.status(404).json({ message: "Invalid credentials" });
    }

    if (!user.verified) {
      return res.status(400).json({ message: "Phone number is not verified" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    return res
      .status(200)
      .json({ message: "Login successful ", user: user.name });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUser = async (req, res) => {
  try {
    const response = await User.findAll();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, phone_number, email, alamat, password, confirm_password } =
    req.body;

  if (password && password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  if (password && password !== confirm_password) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const user = await User.findOne({ where: { id } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ message: "Email is already in use" });
      }
    }

    if (phone_number && phone_number !== user.phone_number) {
      const existingPhoneNumber = await User.findOne({
        where: { phone_number },
      });
      if (existingPhoneNumber) {
        return res
          .status(400)
          .json({ message: "Phone number is already in use" });
      }
    }

    const updateData = {
      name: name || user.name,
      email: email || user.email,
      phone_number: phone_number || user.phone_number,
      alamat: alamat || user.alamat,
      ...(password && { password: await bcrypt.hash(password, 10) }),
    };

    await user.update(updateData, {
      where: { id },
    });

    return res.status(200).json({ message: "User updated" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
