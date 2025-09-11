import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import  User from "./User.js";

const RefreshToken = sequelize.define("RefreshToken", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  token: { type: DataTypes.TEXT, allowNull: false },
  user_id: { type: DataTypes.UUID, references: { model: User, key: "id" } },
  expires_at: { type: DataTypes.DATE, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

export default RefreshToken;
