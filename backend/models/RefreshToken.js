const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const { User } = require("./User");

const RefreshToken = sequelize.define("RefreshToken", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  token: { type: DataTypes.TEXT, allowNull: false },
  user_id: { type: DataTypes.UUID, references: { model: User, key: "id" } },
  expires_at: { type: DataTypes.DATE, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

module.exports = { RefreshToken };
