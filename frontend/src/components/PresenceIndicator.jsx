import React from "react";
import { usePresence } from "../context/PresenceContext";

export default function PresenceIndicator({ boardId }) {
  const { usersByBoard } = usePresence();
  const users = usersByBoard[boardId] || [];
  return (
    <div className="flex items-center space-x-2">
      {users.length === 0 ? <span className="text-sm text-gray-500">No one online</span> : (
        <>
          <span className="text-sm text-gray-500">{users.length} online</span>
          <div className="flex -space-x-2">
            {users.slice(0, 5).map((u, i) => (
              <div key={u} className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center border-white text-center">
                {u[0]?.toUpperCase() || "U"}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
