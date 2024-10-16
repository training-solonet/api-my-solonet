import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Product = db.define(
  "product", 
  {
    kode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    harga: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    gambar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    benefit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    syarat_ketentuan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deskripsi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    underscored: true,
  } 
);

export default Product;
