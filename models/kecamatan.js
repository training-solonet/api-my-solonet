import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import reg_regencies from "./kabupaten.js"; 
const { DataTypes } = Sequelize;

const reg_districts = db.define(
  "reg_districts",
  {
    regency_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: reg_regencies,
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

reg_districts.belongsTo(reg_regencies, {
  foreignKey: "regency_id",
  as: "kabupaten" 
});

export default reg_districts;
