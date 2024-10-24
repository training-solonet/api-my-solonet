import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Product from "./Product.js";
import Customer from "./customer.js";

const { DataTypes } = Sequelize;

const Tagihan = db.define(
  "tagihan",
  {
    bulan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    product_id: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: Product,
        key: "id",
      },
    },
    customer_id: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: Customer,
        key: "id",
      },
    },
    status_pembayaran: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    underscored: true,
  }
);

Tagihan.belongsTo(Product, { foreignKey: "product_id" });
Tagihan.belongsTo(Customer, { foreignKey: "customer_id" });

export default Tagihan;
