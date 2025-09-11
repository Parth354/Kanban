import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Label = sequelize.define("label", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "#cccccc",
  },
}, {
  timestamps: true,
  underscored: true,
});

export default Label;