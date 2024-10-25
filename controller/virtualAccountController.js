import Pembayaran from "../models/pembayaran.js";
import CheckPembayaran from "../models/check_pembayaran.js";
import Tagihan from "../models/tagihan.js";
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
