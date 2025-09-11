// src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import SocketService from "../services/SocketService";
import { AuthContext } from "./AuthContext";
const SocketContext = createContext();

export function SocketProvider({ children }) {
  const { accessToken } = useContext(AuthContext);
  const [socketService, setSocketService] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!accessToken) {
      if (socketService) socketService.disconnect();
      setSocketService(null);
      setSocket(null);
      return;
    }

    const service = new SocketService({
      url: import.meta.env.VITE_APP_WS_URL || "http://localhost:3000",
      getAuth: () => accessToken,
    });

    const sock = service.connect();
    setSocketService(service);
    setSocket(sock);

    return () => {
      service.disconnect();
      setSocketService(null);
      setSocket(null);
    };
  }, [accessToken]);

  return (
    <SocketContext.Provider value={{ socketService, socket }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
};
