import React, { createContext, useState, useContext } from "react";
import { v4 as uuidv4 } from "uuid";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notes, setNotes] = useState([]); // { id, type, message }

  const push = (message, type = "info", ttl = 4000) => {
    const id = uuidv4();
    setNotes(n => [...n, { id, message, type }]);
    if (ttl) setTimeout(() => setNotes(n => n.filter(x => x.id !== id)), ttl);
  };

  const remove = (id) => setNotes(n => n.filter(x => x.id !== id));

  return (
    <NotificationContext.Provider value={{ notes, push, remove }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};
