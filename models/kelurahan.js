import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import reg_districts from "./kecamatan.js";

const { DataTypes } = Sequelize;

const reg_villages = db.define(
  "reg_villages",
  {
    district_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: reg_districts,
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

reg_villages.belongsTo(reg_districts, {
  foreignKey: "district_id",
  as: "kecamatan" 
});

export default reg_villages;
