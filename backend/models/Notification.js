import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Notification = sequelize.define("notification", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type: {
    type: DataTypes.STRING, // e.g., 'card_assigned', 'mentioned', 'due_date'
    allowNull: false,
  },
  data: {
    type: DataTypes.JSONB, // Store context like cardId, boardId
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
  underscored: true,
});

export default Notification;