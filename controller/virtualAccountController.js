import axios from "axios";
import Customer from "../models/customer.js";
import User from "../models/User.js";
import Tagihan from "../models/tagihan.js";
import qs from "qs";

export const bniApi = async (req, res) => {
  try {
    const {
      user_id,
      customer_id,
      description,
      billing_type,
      trx_amount,
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

    const now = new Date();
    const trx_id = `${now.toISOString().slice(0, 10).replace(/-/g, '')}${now.toISOString().slice(11, 13)}${now.toISOString().slice(14, 16)}${user_id}`;

    const expirationDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const expiredDate = expirationDate.toISOString().slice(0, 19).replace('T', ' ');

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

    return res.status(200).json({
      data: bniResponse.data,
      expiredDate: expiredDate,
    });
  } catch (error) {
    console.error("Error pada bniApi:", error);
    return res.status(500).json({ message: error.message });
  }
};
