import Tagihan from "../models/tagihan.js";
import Customer from "../models/customer.js";
import cron from "node-cron"

export const tagihanUser = async (req, res) => {
  try {
      const userId = req.user.id;

      const customers = await Customer.findAll({
          where: { user_id: userId },
          attributes: ['id'], 
      });

      if (!customers.length) {
          return res.status(200).json({ tagihan: [] });
      }

      const customerIds = customers.map(customer => customer.id);

      const tagihanRecords = await Tagihan.findAll({
          where: { customer_id: customerIds },
          include: [{
              model: Customer,
              attributes: ['nama', 'nik'], 
          }],
      });

      return res.status(200).json({ tagihan: tagihanRecords });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
  }
};

cron.schedule("*/15 0 1 * *", async () => {
    const currentDate = new Date().toISOString().slice(0, 10);
    try {
      await Tagihan.update(
        { 
            status_pembayaran: "0",
            bulan: currentDate
         }, 
        {
          where: {}, 
        }
      );
      console.log("Cron job ran successfully: All Tagihan status updated.");
    } catch (error) {
      console.error("Error running cron job:", error);
    }
  });