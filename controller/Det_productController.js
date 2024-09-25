import Det_product from "../models/Det_product.js";

export const det_product = async (req, res) => {
    try {
        const response = await Det_product.findAll();
        res.status(200).json(response);
    } catch (error) {
        console.log(error.message);
    }
}
