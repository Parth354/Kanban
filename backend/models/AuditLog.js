const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./User");
const Board = require("./Board");

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
AuditLog.belongsTo(Board, { foreignKey: "boardId" });

module.exports = AuditLog;
