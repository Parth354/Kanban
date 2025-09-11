import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import Column from "./Column";
import axios from "axios";
import { useSocket } from "../context/SocketContext";
import { usePresence } from "../context/PresenceContext";
import { AuthContext } from "../context/AuthContext";
import PresenceIndicator from "./PresenceIndicator";

const API_URL = "http://localhost:3000/api"; // your backend API base

function Board() {
  const { id } = useParams();
  const { socket } = useSocket();
  const { setPresenceForBoard, removeBoardPresence } = usePresence();
  const { user } = useContext(AuthContext);

  const [columns, setColumns] = useState([]);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  // -----------------------
  // Presence: join room and listen
  // -----------------------
  useEffect(() => {
    // wait for socket and authenticated user
    if (!socket || !user?.id) return;

    const boardId = id;
    const userId = user.id;

    // join board room (server should validate token)
    socket.emit("join-board", { boardId, userId });

    // handle presence updates from server
    const handlePresence = (payload) => {
      // be flexible: server might send either:
      // 1) an array of users, or
      // 2) an object { boardId, users }
      const users = Array.isArray(payload) ? payload : payload?.users;
      // ensure we only pass arrays to the context setter
      if (!Array.isArray(users)) return;
      setPresenceForBoard(boardId, users);
    };

    socket.on("presence-update", handlePresence);

    return () => {
      // leave the room
      socket.emit("leave-board", { boardId, userId });
      socket.off("presence-update", handlePresence);

      // NOTE: we avoid calling removeBoardPresence here to prevent setState during unmount causing
      // potential re-entrancy loops. If you prefer to clear presence on leave, you can
      // uncomment the next line — but test for re-render loops in your environment.
      // removeBoardPresence(boardId);
    };
  }, [socket, user?.id, id, setPresenceForBoard /* removeBoardPresence intentionally excluded */]);

  // -----------------------
  // Load columns for this board
  // -----------------------
  useEffect(() => {
    fetchColumns();
  }, [id]);

  const fetchColumns = async () => {
    try {
      const res = await axios.get(`${API_URL}/columns/${id}`);
      setColumns(res.data || []);
    } catch (err) {
      console.error("Error fetching columns:", err);
    }
  };

  const createColumn = async () => {
    if (!newColumnTitle.trim()) return;
    try {
      const position = columns.length + 1;
      const res = await axios.post(`${API_URL}/columns`, {
        title: newColumnTitle,
        boardId: id,
        position,
      });
      setColumns(prev => [...prev, res.data]);
      setNewColumnTitle("");
    } catch (err) {
      console.error("Error creating column:", err);
    }
  };

  return (
    <div className="p-4">
      {/* Presence Indicator */}
      <div className="mb-4">
        <PresenceIndicator boardId={id} />
      </div>

      {/* Create new column */}
      <div className="mb-4 flex">
        <input
          type="text"
          value={newColumnTitle}
          onChange={(e) => setNewColumnTitle(e.target.value)}
          placeholder="New column title"
          className="border p-2 mr-2 rounded"
        />
        <button
          onClick={createColumn}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Add Column
        </button>
      </div>

      {/* Show existing columns */}
      <div className="flex space-x-4 overflow-x-auto">
        {columns.map((col) => (
          <Column key={col.id} column={col} boardId={id} />
        ))}
      </div>
    </div>
  );
}

export default Board;
