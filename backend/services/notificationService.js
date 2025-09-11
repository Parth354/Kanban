import { Notification } from '../models/index.js';

const getNotificationsForUser = async (userId) => {
  return await Notification.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    limit: 50, // Prevent fetching excessive notifications
  });
};

const markNotificationAsRead = async (notificationId, userId) => {
  const notification = await Notification.findByPk(notificationId);
  if (!notification) throw new Error('Notification not found.');
  if (notification.userId !== userId) {
    throw new Error('Forbidden: You can only access your own notifications.');
  }
  notification.is_read = true;
  await notification.save();
  return notification;
};

const createNotification = async (notificationData) => {
  try {
    return await Notification.create(notificationData);
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
};

export default {
  getNotificationsForUser,
  markNotificationAsRead,
  createNotification
};