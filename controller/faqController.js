import Faq from "../models/faq.js";

export const faq = async (req, res) => {
    try {
        const faq = await Faq.findAll({
            attributes: ["pertanyaan", "jawaban"],
        });

        const formatedFaq = faq.map(faq => ({
            pertanyaan: faq.pertanyaan,
            jawaban: faq.jawaban,
        }))

        res.status(200).json(formatedFaq);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}