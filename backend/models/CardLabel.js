import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const CardLabel = sequelize.define("cardLabel", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
}, {
  timestamps: true,
  underscored: true,
});

export default CardLabel;