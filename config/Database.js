import { Sequelize } from "sequelize";

const db = new Sequelize("db_solonet_app", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

export default db;
