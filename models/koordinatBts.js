import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const koordinatBts = db.define(
    'koordinat_bts',
    {
        lat: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lang: {
            type: DataTypes.STRING,
            allowNull: false
        },
    },
    {
        freezeTableName: true,
        underscored: true
    }
)

export default koordinatBts;