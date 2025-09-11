import React, { createContext, useReducer, useContext } from "react";

export const BoardContext = createContext();

const initialState = {
  board: null,
  columns: [],
  cardsByColumn: {}, // { columnId: [cards] }
  loading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_BOARD":
      return { ...state, board: action.payload };
    case "SET_COLUMNS":
      return { ...state, columns: action.payload };
    case "SET_CARDS":
      return { ...state, cardsByColumn: { ...state.cardsByColumn, [action.columnId]: action.payload } };
    case "ADD_CARD":
      return { ...state, cardsByColumn: { ...state.cardsByColumn, [action.columnId]: [...(state.cardsByColumn[action.columnId]||[]), action.payload] } };
    case "UPDATE_CARD":
      return {
        ...state,
        cardsByColumn: {
          ...state.cardsByColumn,
          [action.columnId]: state.cardsByColumn[action.columnId].map(c => c.id === action.payload.id ? action.payload : c)
        }
      };
    case "REMOVE_CARD":
      return { ...state, cardsByColumn: { ...state.cardsByColumn, [action.columnId]: state.cardsByColumn[action.columnId].filter(c => c.id !== action.cardId) } };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export function BoardProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return <BoardContext.Provider value={{ state, dispatch }}>{children}</BoardContext.Provider>;
}

export const useBoard = () => {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error("useBoard must be used within BoardProvider");
  return ctx;
};
