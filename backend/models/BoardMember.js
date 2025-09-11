import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const BoardMember = sequelize.define("boardMember", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  role: {
    type: DataTypes.ENUM("admin", "member", "viewer"),
    defaultValue: "member",
  },
}, {
  timestamps: true,
  underscored: true,
});

export default BoardMember;