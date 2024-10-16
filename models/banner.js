import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Banner = db.define(
    "banner",
    {
        judul: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        deskripsi: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        gambar: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        freezeTableName: true,
        underscored: true,
    }
)

export default Banner;