import Customer from "../models/customer.js";
import Tagihan from "../models/tagihan.js";

export const tagihanUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const customers = await Customer.findAll({
      where: { user_id: userId },
      attributes: ['id'],
    });

    const customerId = customers.map(customer => customer.id);

    const tagihan = await Tagihan.findAll({
      where: { customer_id: customerId }
    });

    return res.status(200).json({ tagihan: tagihan });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};