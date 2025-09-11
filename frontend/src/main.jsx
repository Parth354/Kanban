import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { BoardProvider } from "./context/BoardContext";
import { PresenceProvider } from "./context/PresenceContext";
import { NotificationProvider } from "./context/NotificationContext";
import { SocketProvider } from "./context/SocketContext";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <SocketProvider>
        <BoardProvider>
          <PresenceProvider>
            <NotificationProvider>
              <App />
            </NotificationProvider>
          </PresenceProvider>
        </BoardProvider>
      </SocketProvider>
    </AuthProvider>
  </React.StrictMode>
);
