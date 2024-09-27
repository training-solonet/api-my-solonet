import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Promo = db.define(
    "promo", 
    {
      id_product: DataTypes.STRING,
      promo: DataTypes.INTEGER,
      durasi_berawal: DataTypes.INTEGER,
      durasi_berakhir: DataTypes.INTEGER
    },
    {
      freezeTableName: true,
      underscored: true
    }
  );
  
  export default Promo;
  
