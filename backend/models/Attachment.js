import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Attachment = sequelize.define("attachment", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  file_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  file_url: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isUrl: true,
    },
  },
  file_type: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: true,
  underscored: true,
});

export default Attachment;