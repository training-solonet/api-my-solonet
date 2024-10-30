import db from "../config/Database.js";
import Product from "./Product.js";
import User from "./User.js";
import { Sequelize } from "sequelize";

const { DataTypes } = Sequelize;

const Customer = db.define(
  "customer",
  {
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id', 
      },
      allowNull: false,
    },
    nama: DataTypes.STRING,
    nik: DataTypes.INTEGER,
    provinsi_id: DataTypes.INTEGER,
    kabupaten_id: DataTypes.INTEGER,
    kecamatan_id: DataTypes.INTEGER,
    kelurahan_id: DataTypes.INTEGER,
    alamat: DataTypes.STRING,
    lat: DataTypes.INTEGER,
    long: DataTypes.INTEGER,
    product_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Product,
        key: 'id', 
      },
      allowNull: true, 
    },
  },
  {
    freezeTableName: true,
    underscored: true,
  }
);

User.hasMany(Customer, {
  foreignKey: "user_id",
  as: "customers",
});

Product.hasMany(Customer, {
  foreignKey: "product_id",
  as: "customers",
});

export default Customer;
