import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import reg_provinces from "./provinsi.js";

const { DataTypes } = Sequelize;

const reg_regencies = db.define(
  "reg_regencies",
  {
    province_id: DataTypes.INTEGER,
    nama: DataTypes.STRING,
  },
  {
    freezeTableName: true,
    underscored: true,
  }
);

reg_regencies.hasMany(reg_provinces, {
    foreignKey: "province_id",
    as: "provinsi",
});

export default reg_regencies;
