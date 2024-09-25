import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const User = db.define(
  "users",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    alamat: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    confirm_password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otp: {
      type: DataTypes.INTEGER,
    },
    verified: {
      type: DataTypes.BOOLEAN,
    },
  },
  {
    freezeTableName: true,
    underscored: true,
  }
);

export default User;

(async () => {
  await db.sync();
})();
