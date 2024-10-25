import Pembayaran from "../models/pembayaran.js";
import CheckPembayaran from "../models/check_pembayaran.js";
import Tagihan from "../models/tagihan.js";
import Customer from "../models/customer.js";
import User from "../models/user.js"; 
import axios from "axios";

async function getAccessTokenBri() {
  try {
    const response = await axios.post(
      `${process.env.BRI_BASE_URL}/oauth/client_credential/accesstoken?grant_type=client_credentials`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.BRI_API_KEY}:${process.env.BRI_SECRET_KEY}`
            ).toString("base64"),
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get access token: " + error);
  }
}

export const createVirtualAccountBRI = async (req, res) => {
  const {
    partnerServiceId,
    customerNo,
    virtualAccountNo,
    virtualAccountName,
    totalAmount,
    expiredDate,
    trxId,
    additionalInfo,
  } = req.body;

  try {
    if (!totalAmount || !totalAmount.value || !totalAmount.currency) {
      return res.status(400).json({
        message: "Invalid total amount",
      });
    }

    const tokenResponse = await getAccessTokenBri();
    const accessToken = tokenResponse.access_token;

    const response = await axios.post("http://localhost:5000/create-bri", {
      partnerServiceId,
      customerNo,
      virtualAccountNo,
      virtualAccountName,
      totalAmount: {
        value: totalAmount.value,
        currency: totalAmount.currency,
      },
      expiredDate,
      trxId,
      additionalInfo: {
        description: additionalInfo.description,
      },
    },{
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    await Pembayaran.create({
      trxId: trxId,
      tanggal_pembayaran: new Date(),
      virtual_account: virtualAccountNo,
      bank: "bri",
      total_pembayaran: totalAmount.value,
      created_at: new Date(),
      updated_at: new Date(),
    });

    res.status(200).json({
      responseCode: response.data.responseCode,
      responseMessage: response.data.responseMessage,
      virtualAccountData: response.data.virtualAccountData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create virtual account",
      error: error.message,
    });
  }
};

export const bniApi = async (req, res) => {
    const { user_id, customer_id, trx_amount, description } = req.body;

    if (!user_id || !customer_id || !trx_amount) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    try {
        const customer = await Customer.findOne({ where: { id: customer_id } });
        if (!customer) {
            return res.status(404).json({ error: "Customer not found." });
        }

        const user = await User.findOne({ where: { id: user_id } });
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const tagihan = await Tagihan.findOne({ where: { customer_id: customer_id } });
        if (!tagihan) {
            return res.status(404).json({ error: "Tagihan not found." });
        }

        const trx_id = `${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}${user_id}`;

        // Generate virtual account
        // const phone_number_suffix = customer.nohp.slice(-8);
        // const virtual_account = `98829702${phone_number_suffix}`;
        const virtual_account = `9882970299788878`;

        const payload = {
            virtual_account,
            trx_id,
            trx_amount,
            customer_name: customer.nama,
            customer_email: user.email,
            customer_phone: customer.nohp,
            description,
            billing_type: new Date(),
            expired_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
        };

        // const response = await createVirtualAccount(payload); 

        await Pembayaran.create({
            tagihan_id: tagihan.id,
            trx_id,
            tanggal_pembayaran: new Date(),
            virtual_account,
            bank: "BNI", 
            total_pembayaran: trx_amount,
        });

        res.status(201).json({
            message: "Virtual account created successfully.",
            virtual_account,
            trx_id,
            customer_name: customer.nama,
            customer_email: user.email,
            customer_phone: customer.nohp,
            description,
            billing_type: payload.billing_type,
            expired_date: payload.expired_date,
        });
    } catch (error) {
        console.error("Error creating virtual account:", error);
        res.status(500).json({ error: error.message });
    }
};
