import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Team = sequelize.define("team", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
  underscored: true,
});

export default Team;