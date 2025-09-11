import { io } from 'socket.io-client';
import useBoardStore from '../store/boardStore';
import useNotificationStore from '../store/notificationStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

class SocketService {
  socket;

  connect(token) {
    // Prevent multiple connections
    if (this.socket && this.socket.connected) return;

    // Disconnect any existing instance before creating a new one
    if (this.socket) {
        this.socket.disconnect();
    }

    this.socket = io(SOCKET_URL, {
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket.id);
    });

    this.setupListeners();
  }

  setupListeners() {
    // Listener for when the list of online users on a board is updated
    this.socket.on('presence-update', (users) => {
      console.log('Received presence-update:', users);
      useBoardStore.getState().setOnlineUsers(users);
    });

    // Listen for events that indicate another user changed something
    const remoteUpdateEvents = ['card-created', 'card-updated', 'card-moved', 'card-deleted'];
    remoteUpdateEvents.forEach(event => {
      this.socket.on(event, (data) => {
        console.log(`Received remote event '${event}':`, data);
        useBoardStore.getState().handleRemoteUpdate();
        // Optionally, push a notification
        useNotificationStore.getState().addNotification(`Board was updated by another user.`);
      });
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
    });

    this.socket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err.message);
    });
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting WebSocket...');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // --- Emitters ---
  joinBoard(boardId, userId) {
    if (this.socket) {
      this.socket.emit('join-board', { boardId, userId });
    }
  }

  leaveBoard(boardId, userId) {
    if (this.socket) {
      this.socket.emit('leave-board', { boardId, userId });
    }
  }
}

const socketService = new SocketService();
export default socketService;