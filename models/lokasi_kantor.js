import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const LokasiKantor = db.define(
    "lokasi_kantor",
    {
        nama: {
            type: DataTypes.STRING,
        },
        lat: {
            type: DataTypes.STRING,
        },
        long: {
            type: DataTypes.STRING,
        },
    },
    {
        freezeTableName: true,
        underscored: true,
    }
)

export default LokasiKantor;