import Customer from "../models/customer.js";

export const getCustomer = async (req, res) => {
    try {
        const response = await Customer.findAll();
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const addCustomer = async (req, res) => {
    try {
        const response = await Customer.create(req.body);
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}