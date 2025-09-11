import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./User.js";
import Board from "./Board.js";

const AuditLog = sequelize.define("auditLog", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  payload: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
}, {
  timestamps: true,
});

AuditLog.belongsTo(User, { foreignKey: "userId" });
User.hasMany(AuditLog, { foreignKey: "userId" });

AuditLog.belongsTo(Board, { foreignKey: "boardId" });
Board.hasMany(AuditLog, { foreignKey: "boardId" });

export default AuditLog;
