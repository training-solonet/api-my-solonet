import { Sequelize } from "sequelize";

const db = new Sequelize("my_solonet", "tino", "training2024", {
  host: "connectis.my.id",
  dialect: "mysql",
}); 

export default db;
