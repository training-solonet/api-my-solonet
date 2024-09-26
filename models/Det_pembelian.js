import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { Datatypes } = Sequelize;

const detail_pembelian = db.define(
    "detail_pembelian",
    {
        no_invoice: Datatypes.STRING,
        id_product: Datatypes.INTEGER,
        qty: Datatypes.INTEGER,
        harga: Datatypes.INTEGER,
    },
    {
        freezeTableName: true,
        underscored: true
    }
);



export default detail_pembelian;