import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./User.js";

const RefreshToken = sequelize.define("refreshToken", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  token: { type: DataTypes.TEXT, allowNull: false },
  expires_at: { type: DataTypes.DATE, allowNull: false },
}, {
  timestamps: true,
});

RefreshToken.belongsTo(User, { foreignKey: "userId" });
User.hasMany(RefreshToken, { foreignKey: "userId" });

export default RefreshToken;
