// File: src/store/notificationStore.js
import { create } from 'zustand';

const useNotificationStore = create((set, get) => ({
  notifications: [], // Shape: { id, message, type: 'info' | 'success' | 'error' }

  addNotification: (message, type = 'info', ttl = 4000) => {
    const id = Date.now() + Math.random();
    set(state => ({
      notifications: [...state.notifications, { id, message, type }],
    }));

    if (ttl) {
      setTimeout(() => {
        get().removeNotification(id);
      }, ttl);
    }
  },

  removeNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id),
    }));
  },
}));

export default useNotificationStore;