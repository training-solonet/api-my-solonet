import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import detail_pembelian from "./Det_pembelian.js";

const { DataTypes } = Sequelize;

const Pembelian = db.define(
  "pembelian",
  {
    no_invoice: DataTypes.STRING,
    virtual_account: DataTypes.STRING,
    tgl_beli: DataTypes.DATE,
    tgl_tempo: DataTypes.DATE,
    ppn: DataTypes.INTEGER,
    total: DataTypes.INTEGER,
    status: DataTypes.STRING,
    id_user: DataTypes.INTEGER,
    product_status: DataTypes.STRING,
    id_transaksi: DataTypes.STRING,
  },
  {
    freezeTableName: true,
    underscored: true,
  }
);

Pembelian.hasMany(detail_pembelian, {
  foreignKey: "no_invoice",
  as: "detail_pembelian",
});

detail_pembelian.belongsTo(Pembelian, { foreignKey: "no_invoice" });

export default Pembelian;
