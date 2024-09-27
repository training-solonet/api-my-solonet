import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const detail_pembelian = db.define(
    "detail_pembelian",
    {
        no_invoice: DataTypes.STRING,
        id_product: DataTypes.INTEGER,
        qty: DataTypes.INTEGER,
        harga_product: DataTypes.INTEGER,
    },
    {
        freezeTableName: true,
        underscored: true
    }
);  

export default detail_pembelian;