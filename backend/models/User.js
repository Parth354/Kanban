import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const User = sequelize.define("user", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  password_hash: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  avatar_url: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true,
    },
  },
}, {
  timestamps: true,
  underscored: true,
});

export default User;