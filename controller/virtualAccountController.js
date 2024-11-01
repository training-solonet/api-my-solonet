import Pembayaran from "../models/pembayaran.js";
import CheckPembayaran from "../models/check_pembayaran.js";
import Tagihan from "../models/tagihan.js";
import Customer from "../models/customer.js";
import User from "../models/User.js";
import axios from "axios";
import qs from "qs";
import dayjs from "dayjs";
import { error } from "console";

export const bniApi = async (req, res) => {
  try {
    const { user_id, customer_id, description, billing_type, trx_amount } =
      req.body;

    const user = await User.findOne({
      where: { id: user_id },
    });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const customer = await Customer.findOne({
      where: {
        id: customer_id,
        user_id: user_id,
      },
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer tidak ditemukan" });
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

    const now = new Date();
    const trx_id = `${now.toISOString().slice(0, 10).replace(/-/g, "")}${now
      .toISOString()
      .slice(11, 13)}${now.toISOString().slice(14, 16)}${user_id}`;

    const expirationDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const expiredDate = expirationDate
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

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

    await CheckPembayaran.create({
      tagihan_id: tagihan.id,
      trx_id: trx_id,
      virtual_account: virtualAccount,
      bank: "bni",
      expired_date: expiredDate,
    });

    res.status(200).json({
      data: bniResponse.data,
      expiredDate: expiredDate,
    });
  } catch (error) {
    console.error("Error pada bniApi:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const BniInquiry = async (req, res) => {
  const { trx_id } = req.body;

  try {
    const checkPembayaran = await CheckPembayaran.findOne({
      where: {
        trx_id: trx_id,
      },
    });
    if (!checkPembayaran) {
      return res.status(404).json({ message: error.message });
    }

    const bniRequestBody = {
      trx_id: trx_id,
    };

    const response = await axios.post(
      `https://billing.solonet.net.id/bni/api/inquiry-virtual-account`,
      qs.stringify(bniRequestBody),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Authorization":
            "fFvCP2kk4wABO8CZO3z25BYF6cAuyGKmpsAIFp4rK4CWmjRkOnXNxNGfQkM5VmHf",
        },
      }
    );
    
    const { additionalInfo } = response.data;

    if (additionalInfo && additionalInfo.va_status === "2") {
    await Pembayaran.create({
      tagihan_id: checkPembayaran.tagihan_id,
      trx_id: trx_id,
      tanggal_pembayaran: new Date(),
      virtual_account: checkPembayaran.virtual_account,
      bank: checkPembayaran.bank,
      total_pembayaran: '150000', //masih statis
    });

    await Tagihan.update(
      { status_pembayaran: '1' },
      { where: { id: checkPembayaran.tagihan_id },
    });
  }

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error pada bniInquiry:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const briApi = async (req, res) => {
  const {
    user_id,
    customer_id,
    tagihan_id,
    partnerServiceId,
    totalAmount,
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

    const existingCheckPembayaran = await CheckPembayaran.findOne({
      where: {
        tagihan_id: tagihan_id,
      },
    });
    if (existingCheckPembayaran) {
      return res
        .status(400)
        .json({ message: "Virtual Account already exists" });
    }

    const phoneLast8Digits = user.phone_number.slice(-7);
    const customerNo = `9087${phoneLast8Digits}`;
    const virtualAccount = `${partnerServiceId}${customerNo}`;
    const now = new Date().toISOString();
    const trxId = `${now.slice(0, 10).replace(/-/g, "")}${now.slice(
      11,
      13
    )}${now.slice(14, 16)}${tagihan_id}`;
    const nama = customer.nama;
    const expiredDate = dayjs()
      .add(1, "day")
      .format("YYYY-MM-DDTHH:mm:ss+07:00");

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

    let response;

    try {
      response = await axios.post(
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
    } catch (error) {
      if (
        error.response &&
        error.response.data.message ===
          "Invalid Bill/Virtual Account already exist"
      ) {
        const randomSuffix = Math.floor(Math.random() * 1000)
          .toString()
          .padStart(1, "0");
        customerNo += randomSuffix;
        virtualAccount = `${partnerServiceId}${customerNo}`;

        briPayload.customerNo = customerNo;
        briPayload.virtualAccountNo = virtualAccount;

        response = await axios.post(
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
      } else {
        throw error;
      }
    }

    await CheckPembayaran.create({
      tagihan_id: tagihan_id,
      trx_id: trxId,
      virtual_account: virtualAccount,
      bank: "bri",
      expired_date: expiredDate,
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

export const checkPembayaranBriva = async (req, res) => {
  const {
    customer_id,
    user_id,
    tagihan_id,
    partnerServiceId,
    inquiryRequestId,
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

    const checkPembayaran = await CheckPembayaran.findOne({
      where: { tagihan_id: tagihan_id, bank: "bri" },
    });
    if (!checkPembayaran) {
      return res.status(404).json({ message: "Check pembayaran not found" });
    }

    const virtualAccountCustomer = checkPembayaran.virtual_account.toString();
    if (!virtualAccountCustomer) {
      return res.status(404).json({
        message: "Virtual account not found or invalid in check pembayaran",
      });
    }
    const customerNo = virtualAccountCustomer.slice(5);
    const virtualAccount = `${partnerServiceId}${customerNo}`;

    const checkPayload = {
      partnerServiceId: partnerServiceId,
      customerNo: customerNo,
      virtualAccountNo: virtualAccount,
      inquiryRequestId: inquiryRequestId,
    };

    const response = await axios.post(
      `https://aplikasi.solonet.net.id/bri/api/inquiry-status`,
      checkPayload,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Authorization":
            "EMD3nAKY0T757NYCuq1uL6W1qvy7QkeSKGv1ZUxzKXp0lwcEHJIsVU1LTWpAnFxA",
        },
      }
    );

    const { additionalInfo } = response.data;

    if (additionalInfo && additionalInfo.paidStatus === "Y") {
      await Pembayaran.create({
        tagihan_id: tagihan.id,
        trx_id: checkPembayaran.trx_id,
        tanggal_pembayaran: new Date(),
        virtual_account: virtualAccountCustomer,
        bank: checkPembayaran.bank,
        total_pembayaran: tagihan.total_tagihan,
      });

      await Tagihan.update(
        { status_pembayaran: 1 },
        { where: { id: tagihan_id } }
      );
    }

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error checking payment:", error.message);
    res.status(500).json({
      message: "Failed to check payment",
      error: error.response ? error.response.data : error.message,
    });
  }
};

export const deleteVaBri = async (req, res) => {
  const { customer_id, user_id, tagihan_id, partnerServiceId } = req.body;

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

    const pembayaran = await CheckPembayaran.findOne({
      where: {
        tagihan_id: tagihan_id,
      },
    });
    if (!pembayaran) {
      return res.status(404).json({ message: "Pembayaran not found" });
    }

    const phoneLast8Digits = user.phone_number.slice(-8);
    const customerNo = `9087${phoneLast8Digits}`;
    const virtualAccount = `${partnerServiceId}${customerNo}`;
    const trx_id = pembayaran.trx_id;

    const deletePayload = {
      partnerServiceId: partnerServiceId,
      customerNo: customerNo,
      virtualAccountNo: virtualAccount,
      trxId: trx_id,
    };

    const response = await axios.delete(
      `https://aplikasi.solonet.net.id/bri/api/delete-va`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Authorization":
            "EMD3nAKY0T757NYCuq1uL6W1qvy7QkeSKGv1ZUxzKXp0lwcEHJIsVU1LTWpAnFxA",
        },
        data: deletePayload,
      }
    );

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error deleting virtual account:", error.message);
    res.status(500).json({
      message: "Failed to delete virtual account",
      error: error.response ? error.response.data : error.message,
    });
  }
};
