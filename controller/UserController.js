import bcrypt from "bcryptjs";
import User from "../models/User.js";
import dotenv from "dotenv";
import moment from "moment-timezone";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import whatsappClient from "../controller/wwebController.js";

dotenv.config();
const client = new OAuth2Client()

async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience:
        "http://216357245101-3704ig9b328jphh1pv7pqjc2m6r4h5q2.apps.googleusercontent.com",
    });
    const payload = ticket.getPayload();
    return payload;
  } catch (error) {
    console.error("Error verifying Google token:", error);
    return null;
  }
}

export const register = async (req, res) => {
  const { name, phone_number, password, confirm_password } = req.body;

  if (password.length <= 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  if (password !== confirm_password) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {

    const existingPhoneNumber = await User.findOne({ where: { phone_number } });
    if (existingPhoneNumber && existingPhoneNumber.verified) {
      return res
        .status(400)
        .json({ message: "Phone number is already in use and verified" });
    }

    if (existingPhoneNumber) {
      const user = existingPhoneNumber;

      const otp = crypto.randomInt(100000, 999999).toString();
      const otpExpiry = moment().add(5, "minutes").toDate();

      await user.update({
        otp: otp,
        otp_expiry: otpExpiry,
      });

      const message = `*Kode OTP* : ${otp}. 
Hati - hati jangan berikan kode ini kepada siapapun. Kode ini akan kadaluarsa dalam 5 menit.`;
      const phoneNumber = `${phone_number}@c.us`;

      whatsappClient.sendMessage(phoneNumber, message);

      return res
        .status(200)
        .json({ message: "OTP sent. Please verify your number." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = moment().add(5, "minutes").toDate();

    await User.create({
      name,
      phone_number,
      password: hashedPassword,
      otp: otp,
      otp_expiry: otpExpiry,
      verified: false,
    });

    const message = `*Kode OTP* : ${otp}. 
Hati - hati jangan berikan kode ini kepada siapapun. Kode ini akan kadaluarsa dalam 5 menit.`;
    const phoneNumber = `${phone_number}@c.us`;

    whatsappClient.sendMessage(phoneNumber, message);

    return res.status(201).json({
      message: "User created successfully. Please verify your number",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { phone_number, password } = req.body;

  try {
    const user = await User.findOne({ where: { phone_number } });

    if (!user) {
      return res.status(404).json({ message: "phone number wrong" });
    }

    if (!user.verified) {
      return res.status(400).json({ message: "Phone number is not verified" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Incorrect Password" });
    }

    const token = jwt.sign(
      { id: user.id, nama: user.name, phone_number: user.phone_number },
      process.env.JWT_SECRET,
      { expiresIn: 86400 }
    );

    return res.status(200).json({
      message: "Login successful ",
      user: { id: user.id, nama: user.name, phone_number: user.phone_number },
      token: token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const googleSignIn = async (req, res) => {
  const { token } = req.body;

  try {

    const payload = await verifyGoogleToken(token);

    if (!payload) {
      return res.status(400).json({
        error: "Invalid Google token",
      });
    }

    let user = await User.findOne({ where: { google_id: payload.sub } });

    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email,
        google_id: payload.sub,
        verified: true,
      });
    } else if (!user.google_id) {
      user.google_id = payload.sub;
      await user.save();
    }

    const jwtToken = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: 86400 }
    );

    return res.status(200).json({
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error signing in with Google:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, phone_number, email, password, confirm_password } = req.body;

  if (password && password.length <= 6) {
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

export const resetPasswordRequest = async (req, res) => {
  const { phone_number } = req.body;

  try {
    const user = await User.findOne({ where: { phone_number } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otp_expiry = moment().add(5, "minutes").toDate();
    user.verified = false;
    await user.save();

    const message = `*Kode OTP* : ${otp}. 
Hati - hati jangan berikan kode ini kepada siapapun. Kode ini akan kadaluarsa dalam 5 menit.`;
    const phoneNumber = `${phone_number}@c.us`;

    whatsappClient.sendMessage(phoneNumber, message);

    return res.status(200).json({ message: "OTP sent" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { phone_number, otp, new_password, confirm_new_password } = req.body;

  if (new_password.length <= 6) {
    return res
      .status(400)
      .json({ message: "New password must be at least 6 characters" });
  }

  if (new_password !== confirm_new_password) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const user = await User.findOne({ where: { phone_number } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (moment().isAfter(user.otp_expiry)) {
      user.otp = null;
      user.otp_expiry = null;
      await user.save();

      return res.status(400).json({ message: "OTP has expired" });
    }

    if (user.otp.trim() !== otp.trim()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(new_password, salt);
    user.otp = null;
    user.otp_expiry = null;
    user.verified = true;
    await user.save();

    return res
      .status(200)
      .json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const sendOtp = async (req, res) => {
  const { phone_number } = req.body;

  try {
    const user = await User.findOne({ where: { phone_number } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const currentTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
    const otpExpiry = moment(currentTime).add(5, "minutes").toDate();

    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otp_expiry = otpExpiry;
    await user.save();

    const message = `*Kode OTP* : ${otp}. 
Hati - hati jangan berikan kode ini kepada siapapun. Kode ini akan kadaluarsa dalam 5 menit.`;
    const phoneNumber = `${phone_number}@c.us`;

    whatsappClient.sendMessage(phoneNumber, message);

    res.json({
      phone_number,
      success: true,
      message: "OTP sent successfully via WhatsApp",
    });
  } catch (error) {
    console.error("Error sending OTP via WhatsApp:", error);
    res.status(500).json({
      success: false,
      message: "Error sending OTP",
      error: error.message,
    });
  }
};

export const verifyOtp = async (req, res) => {
  const { phone_number, otp } = req.body;

  if (!phone_number || !otp) {
    return res.status(400).json({ message: "Phone number and OTP are required" });
  }

  try {
    const user = await User.findOne({ where: { phone_number } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (moment().tz("Asia/Jakarta").isSameOrAfter(moment(user.otp_expiry).tz("Asia/Jakarta"))) {
      user.otp = null;
      user.otp_expiry = null;
      await user.save();
      return res.status(400).json({ message: "OTP has expired" });

    } else {
      user.verified = true;
      user.otp = null;
      user.otp_expiry = null;
      await user.save();

      return res.status(200).json({ message: "Phone number verified" });
    }


  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const changeProfile = async (req, res) => {
  const Userid = req.user.id;
  const { name, phone_number, email } = req.body;

  try {
    const user = await User.findOne({ where: { id: Userid } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ message: "Email is already in use" });
      }
    }

    user.name = name;
    user.phone_number = phone_number;
    await user.save();

    return res.status(200).json({ message: "Profile updated" });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

