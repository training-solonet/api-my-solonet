import db from "../config/Database.js";
import { Sequelize } from "sequelize";

const { DataTypes } = Sequelize;

const Faq = db.define(
    "faq",
    {
        pertanyaan: DataTypes.STRING,
        jawaban: DataTypes.STRING,
    },
    {
        freezeTableName: true,
        underscored: true,
    }
)

export default Faq;