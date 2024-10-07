import bcrypt from "bcryptjs";
import User from "../models/User.js";
import dotenv from "dotenv";
import axios from "axios";
import moment from "moment";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import cron from "node-cron";

dotenv.config();

export const register = async (req, res) => {
  const { name, phone_number, email, password, confirm_password } =
    req.body;

  if (password.length <= 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  if (password !== confirm_password) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail && existingEmail.verified) {
      return res
        .status(400)
        .json({ message: "Email is already in use and verified" });
    }

    const existingPhoneNumber = await User.findOne({ where: { phone_number } });
    if (existingPhoneNumber && existingPhoneNumber.verified) {
      return res
        .status(400)
        .json({ message: "Phone number is already in use and verified" });
    }

    if (existingEmail || existingPhoneNumber) {
      const user = existingEmail || existingPhoneNumber;

      const otp = crypto.randomInt(100000, 999999).toString();
      const otpExpiry = moment().add(5, "minutes").toDate();

      await user.update({
        otp: otp,
        otp_expiry: otpExpiry,
      });

      await axios.post(
        "https://omnichannel.qiscus.com/whatsapp/v1/" +
          process.env.QISCUS_APP_ID +
          "/" +
          process.env.WA_CHANNEL_ID +
          "/messages",
        {
          to: phone_number,
          type: "template",
          template: {
            namespace: process.env.WA_TEMPLATE_NAMESPACE,
            name: process.env.WA_TEMPLATE_NAME,
            language: {
              policy: "deterministic",
              code: "id",
            },
            components: [
              {
                type: "body",
                parameters: [
                  {
                    type: "text",
                    text: otp,
                  },
                ],
              },
              {
                type: "button",
                sub_type: "url",
                index: "0",
                parameters: [
                  {
                    type: "text",
                    text: otp,
                  },
                ],
              },
            ],
          },
        },
        {
          headers: {
            "Qiscus-App-Id": process.env.QISCUS_APP_ID,
            "Qiscus-Secret-Key": process.env.QISCUS_SECRET_KEY,
            "Content-Type": "application/json",
          },
        }
      );

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
      email,
      password: hashedPassword,
      otp: otp,
      otp_expiry: otpExpiry,
      verified: false,
    });

    await axios.post(
      "https://omnichannel.qiscus.com/whatsapp/v1/" +
        process.env.QISCUS_APP_ID +
        "/" +
        process.env.WA_CHANNEL_ID +
        "/messages",
      {
        to: phone_number,
        type: "template",
        template: {
          namespace: process.env.WA_TEMPLATE_NAMESPACE,
          name: process.env.WA_TEMPLATE_NAME,
          language: {
            policy: "deterministic",
            code: "id",
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: otp,
                },
              ],
            },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [
                {
                  type: "text",
                  text: otp,
                },
              ],
            },
          ],
        },
      },
      {
        headers: {
          "Qiscus-App-Id": process.env.QISCUS_APP_ID,
          "Qiscus-Secret-Key": process.env.QISCUS_SECRET_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return res
      .status(201)
      .json({
        message: "User created successfully. Please verify your number",
      });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Internal server error" });
  }
};

export const registerGoogle = async (profile) => {
  try {
    let user = await User.findOne({ where: { google_id: profile.id } });

    if (!user) {
      user = await User.findOne({ where: { email: profile.emails[0].value } });

      if (user) {
        user.google_id = profile.id;
        await user.save();
        return user;
      }

      if (!user) {
        const user = await User.create({
          google_id: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          verified: true,
        });
        await user.save();
      }
    }
    return user;
  } catch (error) {
    console.error("Error register google", error);
    return null;
  }
};

export const login = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "Email wrong or not found" });
    }

    if (!user.verified) {
      return res.status(400).json({ message: "Phone number is not verified" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Incorrect Password" });
    }

    const token = jwt.sign(
      { id: user.id, nama:user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: 86400 }
    );

    return res
      .status(200)
      .json({ 
        message: "Login successful ",
        user: { id:user.id, nama:user.name ,email: user.email }, 
        token: token,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const loginGoogle = async (profile) => {
  try {
    const user = await User.findOne({ where: { google_id: profile.id } });

    if (!user) {
      return user;
    }

    return null;
  } catch (error) {
    console.error("Error login google", error);
    return null;
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
  const { name, phone_number, email, password, confirm_password } =
    req.body;

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

    await axios.post(
      "https://omnichannel.qiscus.com/whatsapp/v1/" +
        process.env.QISCUS_APP_ID +
        "/" +
        process.env.WA_CHANNEL_ID +
        "/messages",
      {
        to: phone_number,
        type: "template",
        template: {
          namespace: process.env.WA_TEMPLATE_NAMESPACE,
          name: process.env.WA_TEMPLATE_NAME,
          language: {
            policy: "deterministic",
            code: "id",
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: otp,
                },
              ],
            },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [
                {
                  type: "text",
                  text: otp,
                },
              ],
            },
          ],
        },
      },
      {
        headers: {
          "Qiscus-App-Id": process.env.QISCUS_APP_ID,
          "Qiscus-Secret-Key": process.env.QISCUS_SECRET_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json({ message: "OTP sent" });
  } catch (error) {}
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
  const { phone_number, otp } = req.body;

  try {
    const user = await User.findOne({ where: { phone_number } });

    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otp_expiry = moment().add(5, "minutes").toDate();
    await user.save();

    const response = await axios.post(
      "https://omnichannel.qiscus.com/whatsapp/v1/" +
        process.env.QISCUS_APP_ID +
        "/" +
        process.env.WA_CHANNEL_ID +
        "/messages",
      {
        to: phone_number,
        type: "template",
        template: {
          namespace: process.env.WA_TEMPLATE_NAMESPACE,
          name: process.env.WA_TEMPLATE_NAME,
          language: {
            policy: "deterministic",
            code: "id",
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: otp,
                },
              ],
            },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [
                {
                  type: "text",
                  text: otp,
                },
              ],
            },
          ],
        },
      },
      {
        headers: {
          "Qiscus-App-Id": process.env.QISCUS_APP_ID,
          "Qiscus-Secret-Key": process.env.QISCUS_SECRET_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    // Send the response back to the client
    res.json({
      success: true,
      message: "OTP sent successfully",
      data: response.data,
    });
  } catch (error) {
    console.error(
      "Error sending message:",
      error.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      message: "Error sending message",
      error: error.response?.data || error.message,
    });
  }
};

export const verifyOtp = async (req, res) => {
  const { phone_number, otp } = req.body;

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

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.verified = true;
    user.otp = null;
    user.otp_expiry = null;
    await user.save();

    return res.status(200).json({ message: "Phone number verified" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

cron.schedule("*/5 * * * *", async () => {
  try {
    const expiredUsers = await User.findAll({
      where: {
        otp_expiry: {
          [Op.lt]: moment().toDate(),
        },
        otp: {
          [Op.not]: null,
        },
      },
    });

    for (const user of expiredUsers) {
      await user.update({
        otp: null,
        otp_expiry: null,
      });
    }

    console.log("Expired OTPs removed successfully");
  } catch (error) {
    console.error("Error while removing expired OTPs:", error);
  }
});