import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosClient from '../api/axiosClient';
import socketService from '../services/SocketService';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const response = await axiosClient.post('/auth/login', { email, password });
        const { accessToken, user } = response.data;
        set({ user, accessToken, isAuthenticated: true });
        
        // Connect to WebSocket after successful login
        socketService.connect(accessToken);
        
        return user;
      },

      register: async (name, email, password) => {
        return await axiosClient.post('/auth/register', { name, email, password });
      },

      logout: async () => {
        try {
            await axiosClient.post('/auth/logout');
        } catch (error) {
            console.error("Logout failed on server, clearing client-side state anyway.", error);
        } finally {
            // Disconnect socket on logout
            socketService.disconnect();
            set({ user: null, accessToken: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'kanban-auth-storage', // unique name for localStorage
    }
  )
);

// This part is crucial: it initializes the socket connection on app load if the user is already logged in.
const initialAuthToken = useAuthStore.getState().accessToken;
if (initialAuthToken) {
  socketService.connect(initialAuthToken);
}

export default useAuthStore;