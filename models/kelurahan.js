import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import reg_districts from "./kecamatan.js";

const { DataTypes } = Sequelize;

const reg_villages = db.define(
  "reg_villages",
  {
    district_id: DataTypes.INTEGER,
    nama: DataTypes.STRING,
  },
  {
    freezeTableName: true,
    underscored: true,
  }
);

Product.hasMany(reg_districts, {
    foreignKey: "village_id",
    as: "kelurahan",
});

export default reg_villages;
