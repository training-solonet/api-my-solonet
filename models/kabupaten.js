import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import reg_provinces from "./provinsi.js"; // Pastikan ini diimpor jika ada relasi

const { DataTypes } = Sequelize;

const reg_regencies = db.define(
  "reg_regencies",
  {
    province_id: {
      type: DataTypes.INTEGER,
      allowNull: false, 
      references: {
        model: reg_provinces,
        key: 'id' 
      }
    },
    name: DataTypes.STRING
  },
  {
    freezeTableName: true,
    underscored: true
  }
);

reg_regencies.belongsTo(reg_provinces, {
  foreignKey: "province_id", 
  as: "provinsi"
});

export default reg_regencies;
