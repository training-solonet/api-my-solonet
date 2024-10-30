import Pembayaran from "../models/pembayaran.js";
import CheckPembayaran from "../models/check_pembayaran.js";
import Tagihan from "../models/tagihan.js";
import Customer from "../models/customer.js";
import User from "../models/User.js";
import axios from "axios";
import qs from "qs";

export const bniApi = async (req, res) => {
  try {
    const {
      user_id,
      customer_id,
      description,
      billing_type,
      trx_amount,
      expiredDate,
    } = req.body;

    const customer = await Customer.findOne({
      where: {
        id: customer_id,
        user_id: user_id,
      },
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer tidak ditemukan" });
    }

    const user = await User.findOne({
      where: { id: user_id },
    });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const tagihan = await Tagihan.findOne({
      where: {
        customer_id: customer_id,
        status_pembayaran: "0",
      },
    });

    if (!tagihan) {
      return res.status(404).json({ message: "Tagihan tidak ditemukan" });
    }

    const phoneLast8Digits = user.phone_number.slice(-8);
    const virtualAccount = `98829702${phoneLast8Digits}`;

    const now = new Date().toISOString();
    const trx_id = `${now.slice(0, 10).replace(/-/g, "")}${now.slice(
      11,
      13
    )}${now.slice(14, 16)}${user_id}`;

    const bniRequestBody = {
      virtual_account: virtualAccount,
      trx_id: trx_id,
      description: description,
      billing_type: billing_type,
      trx_amount: trx_amount,
      user_id: user_id,
      expiredDate: expiredDate,
      customer_name: customer.nama,
      customer_phone: user.phone_number,
    };

    const bniResponse = await axios.post(
      `https://billing.solonet.net.id/bni/api/create-virtual-account`,
      qs.stringify(bniRequestBody),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Authorization":
            "fFvCP2kk4wABO8CZO3z25BYF6cAuyGKmpsAIFp4rK4CWmjRkOnXNxNGfQkM5VmHf",
        },
      }
    );

    await Pembayaran.create({
      tagihan_id: tagihan.id,
      trx_id: trx_id,
      tanggal_pembayaran: new Date(),
      virtual_account: virtualAccount,
      bank: "bni",
      total_pembayaran: trx_amount,
    });

    return res.status(200).json({
      data: bniResponse.data,
    });
  } catch (error) {
    console.error("Error pada bniApi:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const briApi = async (req, res) => {
  const {
    user_id,
    customer_id,
    partnerServiceId,
    totalAmount,
    expiredDate,
    additionalInfo,
  } = req.body;

  try {
    const customer = await Customer.findOne({
      where: {
        id: customer_id,
      },
    });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const user = await User.findOne({
      where: {
        id: user_id,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const tagihan = await Tagihan.findOne({
      where: {
        customer_id: customer_id,
      },
    });
    if (!tagihan) {
      return res.status(404).json({ message: "Tagihan not found" });
    }

    const phoneLast8Digits = user.phone_number.slice(-8);
    const customerNo = `9087${phoneLast8Digits}`;
    const virtualAccount = `${partnerServiceId}${customerNo}`;
    const now = new Date().toISOString();
    const trxId = `${now.slice(0, 10).replace(/-/g, "")}${now.slice(
      11,
      13
    )}${now.slice(14, 16)}${user_id}`;
    const nama = customer.nama;

    const briPayload = {
      partnerServiceId: partnerServiceId,
      customerNo: customerNo,
      virtualAccountNo: virtualAccount,
      virtualAccountName: nama,
      totalAmount: {
        value: totalAmount.value,
        currency: totalAmount.currency,
      },
      expiredDate: expiredDate,
      trxId: trxId,
      additionalInfo: {
        description: additionalInfo.description,
      },
    };

    const response = await axios.post(
      `https://aplikasi.solonet.net.id/bri/api/create-va`,
      briPayload,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Authorization":
            "EMD3nAKY0T757NYCuq1uL6W1qvy7QkeSKGv1ZUxzKXp0lwcEHJIsVU1LTWpAnFxA",
        },
      }
    );

    await Pembayaran.create({
      tagihan_id: tagihan.id,
      trx_id: trxId,
      tanggal_pembayaran: new Date(),
      virtual_account: virtualAccount,
      bank: "bri",
      total_pembayaran: totalAmount.value,
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error creating virtual account:", error.message);
    res.status(500).json({
      message: "Failed to create virtual account",
      error: error.response ? error.response.data : error.message,
    });
  }
};
