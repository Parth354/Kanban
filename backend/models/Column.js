const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Board = require("./Board");

const Column = sequelize.define("column", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: true,
});

Column.belongsTo(Board, { foreignKey: "boardId" });
Board.hasMany(Column, { foreignKey: "boardId" });

module.exports = Column;
