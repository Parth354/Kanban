const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Column = require("./Column");
const User = require("./User");

const Card = sequelize.define("card", {
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
  position: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: true,
});

Card.belongsTo(Column, { foreignKey: "columnId" });
Column.hasMany(Card, { foreignKey: "columnId" });

Card.belongsTo(User, { foreignKey: "assigneeId" });
User.hasMany(Card, { foreignKey: "assigneeId" });

module.exports = Card;
