import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Det_product from "./Det_product.js";

const { DataTypes } = Sequelize;

const Product = db.define(
  "product", 
  {
    kode: DataTypes.STRING,
    nama: DataTypes.STRING,
    id_satuan: DataTypes.INTEGER,
    id_kategori: DataTypes.INTEGER,
    harga_jual: DataTypes.INTEGER,
    durasi: DataTypes.STRING,
    stok: DataTypes.INTEGER,
    gambar: DataTypes.STRING,
  },
  {
    freezeTableName: true,
    underscored: true,
  }
);

Product.hasMany(Det_product, {
  foreignKey: "id_product",
  as: "detail_product",
});

Det_product.belongsTo(Product, { foreignKey: "id_product" });

export default Product;
