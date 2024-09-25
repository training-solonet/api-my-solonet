import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Detail_product = db.define(
    "detail_product", 
    {
      id_product: DataTypes.STRING,
      syarat: DataTypes.STRING,
      ketentuan: DataTypes.STRING,
      deskripsi: DataTypes.STRING
    },
    {
      freezeTableName: true,
      underscored: true
    }
  );
  
  export default Detail_product;
  