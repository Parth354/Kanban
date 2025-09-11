import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Comment = sequelize.define("comment", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  timestamps: true,
  underscored: true,
});

export default Comment;