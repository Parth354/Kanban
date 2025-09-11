import {Sequelize} from "sequelize"
import { configDotenv } from "dotenv";
configDotenv({path:"../.env"})
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false } // for Supabase
  },
  logging: false,
});

export default sequelize;
