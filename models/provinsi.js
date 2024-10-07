import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const reg_provinces = db.define(
    "reg_provinces", 
    {
      nama: DataTypes.STRING
    },
    {
      freezeTableName: true,
      underscored: true
    }
  );
  
  export default reg_provinces;
  
