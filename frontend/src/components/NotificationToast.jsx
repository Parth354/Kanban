import React from "react";
import { useNotifications } from "../context/NotificationContext";

export default function NotificationToast() {
  const { notes, remove } = useNotifications();
  return (
    <div style={{ position: "fixed", right: 16, top: 16, zIndex: 9999 }}>
      {notes.map((n) => (
        <div key={n.id} className="mb-2 p-3 rounded shadow" style={{ background: "#111827", color: "#fff", minWidth: 220 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{n.type.toUpperCase()}</strong>
            <button onClick={() => remove(n.id)}>✕</button>
          </div>
          <div style={{ marginTop: 8 }}>{n.message}</div>
        </div>
      ))}
    </div>
  );
}
