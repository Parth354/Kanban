import {Sequelize} from "sequelize"
import { configDotenv } from "dotenv";
configDotenv({path:"../.env"})
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false }
  },
  logging: false,
});

export default sequelize;
