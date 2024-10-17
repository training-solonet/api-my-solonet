import Tagihan from "../models/tagihan.js";
import cron from "node-cron"

export const tagihanUser = async (req, res) => {
    const userId = req.user.id;

    Tagihan.findByPk(userId)
        .then((result) => {
            res.json(result);
        })
        .catch((error) => {
            console.log(error);
            res.status(500).json({ message: "Internal Server Error" });
        });
}

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