import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Kategori = db.define(
    "kategori", 
    {
      nama: DataTypes.STRING,
      keterangan: DataTypes.STRING,
    },
    {
      freezeTableName: true,
      underscored: true
    }
  );
  
  export default Kategori;
  
