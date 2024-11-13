import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Tagihan from "./tagihan.js";

const { DataTypes } = Sequelize;

const Pembayaran = db.define(
    "pembayaran",
    {
        tagihan_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Tagihan,
                key: "id",
            },
        },
        trx_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        tanggal_pembayaran: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        virtual_account: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        bank: {
            type: DataTypes.ENUM('bni', 'bri'),
            allowNull: false,
        },
        total_pembayaran: {
            type: DataTypes.INTEGER,
            allowNull:false,
        }
    },
    {
        freezeTableName: true,
        underscored: true,
    }
);

Pembayaran.belongsTo(Tagihan, { foreignKey: "tagihan_id" });

export default Pembayaran;