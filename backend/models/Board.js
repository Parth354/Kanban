import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

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
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  visibility: {
    type: DataTypes.ENUM("private", "team", "public"),
    defaultValue: "private",
  },
}, {
  timestamps: true,
  underscored: true,
});

export default Board;