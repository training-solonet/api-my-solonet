import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const User = db.define(
  "users",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nik: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: true,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    confirm_password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otp: {
      type: DataTypes.INTEGER,
    },
    otp_expiry: {
      type: DataTypes.DATE,
    },
    verified: {
      type: DataTypes.BOOLEAN,
    },
    google_id: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    }
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
