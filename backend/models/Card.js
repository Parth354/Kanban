import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Column from "./Column.js";
import User from "./User.js";

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

export default Card;
