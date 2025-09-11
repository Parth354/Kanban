// src/context/PresenceContext.jsx
import React, { createContext, useState, useCallback, useContext } from "react";

/**
 * PresenceContext
 * ----------------
 * Responsibilities:
 * - Store presence state: a mapping from boardId -> users[]
 * - Provide stable, memoized functions to update or remove presence for a board:
 *    - setPresenceForBoard(boardId, users)
 *    - removeBoardPresence(boardId)
 *
 * Notes:
 * - This context DOES NOT subscribe to sockets directly. Components (e.g., Board.jsx)
 *   should listen to socket events and call `setPresenceForBoard`.
 * - The setter performs a shallow-equality check to avoid unnecessary state updates
 *   (helps prevent infinite render loops when the same array/value is re-sent).
 */

const PresenceContext = createContext();

export function PresenceProvider({ children }) {
  // Map of boardId -> users array
  const [usersByBoard, setUsersByBoard] = useState({});

  // Helper: shallow equality for arrays (works for array of primitives or stable object references)
  const arraysShallowEqual = (a, b) => {
    if (a === b) return true;
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  };

  /**
   * setPresenceForBoard
   * - memoized so identity is stable across renders
   * - performs shallow equality check to avoid unnecessary updates
   */
  const setPresenceForBoard = useCallback((boardId, users) => {
    if (!boardId) return;
    if (!Array.isArray(users)) return;

    setUsersByBoard((prev) => {
      const prevUsers = prev[boardId] || [];

      // if arrays are shallow-equal, keep previous state object (no re-render)
      if (arraysShallowEqual(prevUsers, users)) {
        return prev;
      }

      return { ...prev, [boardId]: users };
    });
  }, []);

  /**
   * removeBoardPresence
   * - memoized to keep stable identity
   * - removes the board key from the map (no-op if not present)
   */
  const removeBoardPresence = useCallback((boardId) => {
    if (!boardId) return;

    setUsersByBoard((prev) => {
      if (!prev[boardId]) return prev;
      const copy = { ...prev };
      delete copy[boardId];
      return copy;
    });
  }, []);

  return (
    <PresenceContext.Provider value={{ usersByBoard, setPresenceForBoard, removeBoardPresence }}>
      {children}
    </PresenceContext.Provider>
  );
}

/**
 * Hook: usePresence
 * - returns the context (throws if used outside provider)
 */
export const usePresence = () => {
  const ctx = useContext(PresenceContext);
  if (!ctx) {
    throw new Error("usePresence must be used within PresenceProvider");
  }
  return ctx;
};

export default PresenceContext;
