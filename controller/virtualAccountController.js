import Pembayaran from "../models/pembayaran.js";
import CheckPembayaran from "../models/check_pembayaran.js";
import Tagihan from "../models/tagihan.js";
import Customer from "../models/customer.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import axios from "axios";
import qs from "qs";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import { error } from "console";

export const bniApi = async (req, res) => {
  try {
    const { customer_id, tagihan_id } = req.body;

    const user_id = req.user_id;
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
        id: tagihan_id,
        customer_id: customer_id,
      },
      include: {
        model: Product,
        attributes: ["harga"],
      },
    });

    if (!tagihan) {
      return res.status(404).json({ message: "Tagihan tidak ditemukan" });
    }

    let currentDate = new Date();
    let bulan = currentDate.toLocaleString("default", { month: "long" });
    const description = "Tagihan Internet Bulan " + bulan;

    const trx_amount = tagihan.product.harga;

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
      trx_amount: trx_amount,
      user_id: user_id,
      expiredDate: expiredDate,
      customer_name: customer.nama,
      customer_phone: user.phone_number,
    };

    const bniResponse = await axios.post(
      process.env.BNI_API_CREATE_URL,
      qs.stringify(bniRequestBody),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Authorization": process.env.BNI_API_KEY,
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
      trx_amount: trx_amount,
      expired_date: expiredDate,
    });
  } catch (error) {
    console.error("Error pada bniApi:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const BniInquiry = async (req, res) => {
  const { customer_id, trx_id, tagihan_id } = req.body;

  const user_id = req.user_id;

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
        id: tagihan_id,
      },
      include: {
        model: Product,
        attributes: ["harga"],
      },
    });
    if (!tagihan) {
      return res.status(404).json({ message: "Tagihan not found" });
    }
    const total_tagihan = tagihan.product.harga;

    const checkPembayaran = await CheckPembayaran.findOne({
      where: {
        trx_id: trx_id,
        tagihan_id: tagihan_id,
      },
    });
    if (!checkPembayaran) {
      return res.status(404).json({ message: error.message });
    }

    const bniRequestBody = {
      trx_id: trx_id,
    };

    const response = await axios.post(
      process.env.BNI_API_INQUIRY_URL,
      qs.stringify(bniRequestBody),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Authorization": process.env.BNI_API_KEY,
        },
      }
    );

    const { data } = response.data;

    if (data && data.payment_amount == total_tagihan) {
      await Pembayaran.create({
        tagihan_id: checkPembayaran.tagihan_id,
        trx_id: trx_id,
        tanggal_pembayaran: new Date(),
        virtual_account: checkPembayaran.virtual_account,
        bank: checkPembayaran.bank,
        total_pembayaran: total_tagihan,
      });

      await Tagihan.update(
        { status_pembayaran: "1" },
        { where: { id: checkPembayaran.tagihan_id } }
      );
    }

    res.status(response.status).json({
      data: response.data,
      tagihan_id: tagihan_id,
    });
  } catch (error) {
    console.error("Error pada bniInquiry:", error);
    return res.status(500).json({ message: error.message });
  }
};

const deleteVirtualAccountBRI = async (tagihan_id, user, res) => {
  const checkPembayaran = await CheckPembayaran.findOne({
    where: { tagihan_id },
  });
  if (!checkPembayaran) {
    return res.status(404).json({ message: "Check pembayaran not found" });
  }

  const partnerServiceId = "14948";
  const phoneLast8Digits = user.phone_number.slice(-8);
  const customerNo = `9087${phoneLast8Digits}`;
  const virtualAccount = `${partnerServiceId}${customerNo}`;
  const trx_id = checkPembayaran.trx_id;

  try {
    const response = await axios.delete(
      `${process.env.BRI_API}delete-va?partnerServiceId=${encodeURIComponent(
        partnerServiceId
      )}&customerNo=${encodeURIComponent(
        customerNo
      )}&virtualAccountNo=${encodeURIComponent(
        virtualAccount
      )}&trxId=${encodeURIComponent(trx_id)}`,
      {
        headers: {
          "X-Authorization": `${process.env.X_AUTH}`,
        },
      }
    );

    await CheckPembayaran.destroy({
      where: { tagihan_id },
    });

    console.log("Virtual Account deleted successfully");
    return response;
  } catch (error) {
    console.error("Error deleting virtual account:", error.message);
    throw new Error("Failed to delete virtual account");
  }
};

export const briApi = async (req, res) => {
  const { customer_id, tagihan_id } = req.body;

  const user_id = req.user_id;

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
        id: tagihan_id,
        customer_id: customer_id,
      },
    });
    if (!tagihan) {
      return res.status(404).json({ message: "Tagihan not found" });
    }

    const product = await Product.findOne({
      where: {
        id: tagihan.product_id,
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existingCheckPembayaran = await CheckPembayaran.findOne({
      where: {
        tagihan_id: tagihan_id,
      },
    });
    if (existingCheckPembayaran) {
      await deleteVirtualAccountBRI(tagihan_id, user, res);
    }

    const totalAmount = product.harga;
    const month = dayjs(tagihan.bulan).format("MMMM");
    const description = `Pembayaran produk ${product.nama} bulan ${month}`;

    const partnerServiceId = "   14948";
    const phoneLast8Digits = user.phone_number.slice(-8);
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
        value: `${totalAmount.toString()}.00`,
        currency: "IDR",
      },
      expiredDate: expiredDate,
      trxId: trxId,
      additionalInfo: {
        description: description,
      },
    };

    const response = await axios.post(
      `${process.env.BRI_API}create-va`,
      briPayload,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Authorization":
            process.env.X_AUTH,
        },
      }
    );

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
  const { customer_id, tagihan_id } = req.body;

  const user_id = req.user_id;
  const inquiryRequestId = uuidv4();

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

    const partnerServiceId = "   14948";
    const customerNo = virtualAccountCustomer.slice(5);
    const virtualAccount = `${partnerServiceId}${customerNo}`;

    const checkPayload = {
      partnerServiceId: partnerServiceId,
      customerNo: customerNo,
      virtualAccountNo: virtualAccount,
      inquiryRequestId: inquiryRequestId,
    };

    const response = await axios.post(
      `${process.env.BRI_API}inquiry-status`,
      checkPayload,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Authorization":
            process.env.X_AUTH,
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

