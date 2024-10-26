import Pembayaran from "../models/pembayaran.js";
import Tagihan from "../models/tagihan.js";
import Customer from "../models/customer.js";
import User from "../models/User.js"; 

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
