import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

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
    defaultValue: 0,
  },
  priority: {
    type: DataTypes.ENUM("low", "medium", "high"),
    defaultValue: "medium",
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
  underscored: true,
});

export default Card;