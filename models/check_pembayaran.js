import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Tagihan from "./tagihan.js";

const { DataTypes } = Sequelize;

const CheckPembayaran = db.define(
    "check_pembayaran",
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
        virtual_account: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        bank: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        expired_date: {
            type: DataTypes.DATE,
            allowNull: false,
        }
    },
    {
        freezeTableName: true,
        underscored: true,
    }
);

CheckPembayaran.belongsTo(Tagihan, { foreignKey: "tagihan_id" });

export default CheckPembayaran;