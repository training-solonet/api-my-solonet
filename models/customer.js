import db from "../config/Database.js";
import Product from "./Product.js";
import { Sequelize } from "sequelize";

const { DataTypes } = Sequelize;

const Customer = db.define(
  "customer",
  {
    user_id: DataTypes.INTEGER,
    nama: DataTypes.STRING,
    nik: DataTypes.INTEGER,
    provinsi_id: DataTypes.INTEGER,
    kabupaten_id: DataTypes.INTEGER,
    kecamatan_id: DataTypes.INTEGER,
    kelurahan_id: DataTypes.INTEGER,
    alamat: DataTypes.STRING,
    lat: DataTypes.INTEGER,
    long: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
  },
  {
    freezeTableName: true,
    underscored: true,
  }
);

Product.hasMany(Customer, {
  foreignKey: "product_id",
  as: "customers",
});

export default Customer;
