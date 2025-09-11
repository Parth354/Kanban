import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./User.js";

const Board = sequelize.define("board", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
});

Board.belongsTo(User, { foreignKey: "ownerId" });
User.hasMany(Board, { foreignKey: "ownerId" });

export default Board;
