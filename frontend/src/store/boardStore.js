// File: src/store/boardStore.js
import { create } from 'zustand';
import axiosClient from '../api/axiosClient';
import { createColumn, moveColumn as apiMoveColumn, deleteColumn as apiDeleteColumn } from '../api/columnService';
import { getBoardMembers } from '../api/memberService';
import { assignUserToCard as apiAssignUser, deleteCard as apiDeleteCard } from '../api/cardService';

const useBoardStore = create((set, get) => ({
  board: null,
  members: [],
  loading: true,
  error: null,
  onlineUsers: [],

  fetchBoard: async (boardId) => {
    set({ loading: true, error: null });
    try {
      const boardRes = await axiosClient.get(`/boards/${boardId}`);
      const membersRes = await getBoardMembers(boardId);
      boardRes.data.columns.forEach(col => {
        if (col.cards) col.cards.sort((a, b) => a.position - b.position);
        else col.cards = [];
      });
      set({ board: boardRes.data, members: membersRes, loading: false });
    } catch (error) {
      console.error("Failed to fetch board or members:", error);
      set({ error: 'Failed to load board data.', loading: false });
    }
  },

  moveCard: async (source, destination, draggableId) => {
    // --- START: Robustness Checks & Logging ---
    console.group("--- Drag & Drop: moveCard Action ---");
    console.log("Draggable ID:", draggableId, `(Type: ${typeof draggableId})`);
    console.log("Source:", source);
    console.log("Destination:", destination);

    // CRITICAL CHECK: If the card is a temporary one (just created), we should not call the API.
    // The backend doesn't know about `temp-...` IDs. The optimistic update is enough.
    if (String(draggableId).startsWith('temp-')) {
        console.warn("Drag detected on a temporary card. API call will be skipped. State is already updated optimistically.");
        console.groupEnd();
        return; // Stop the function here.
    }

    const payload = {
      newColumnId: destination.droppableId,
      newPosition: destination.index,
    };
    console.log("Payload to be sent to backend:", payload);
    console.groupEnd();
    // --- END: Robustness Checks & Logging ---

    const originalBoard = get().board;
    // ... (keep the optimistic update logic exactly as it was)
    let newBoard = JSON.parse(JSON.stringify(originalBoard));
    const sourceColumn = newBoard.columns.find(c => c.id === source.droppableId);
    const destColumn = newBoard.columns.find(c => c.id === destination.droppableId);
    if (!sourceColumn || !destColumn) {
        console.error("Drag failed: could not find source or destination column.");
        return;
    }
    const [movedCard] = sourceColumn.cards.splice(source.index, 1);
    destColumn.cards.splice(destination.index, 0, movedCard);
    destColumn.cards.forEach((card, index) => { card.position = index; });
    if (source.droppableId !== destination.droppableId) {
      sourceColumn.cards.forEach((card, index) => { card.position = index; });
    }
    set({ board: newBoard });

    try {
      // Ensure the ID is a string before sending
      await axiosClient.post(`/cards/${String(draggableId)}/move`, payload);
    } catch (error) {
      // Log the specific error message from the backend validator
      console.error("SERVER REJECTED MOVE:", error.response?.data || error.message);
      set({ board: originalBoard, error: "Failed to sync card move. Reverting." });
    }
},


  addCard: async (cardData) => {
    const originalBoard = get().board;
    const newCard = { ...cardData, id: `temp-${Date.now()}`, labels: [], attachments: [] };
    const newBoard = JSON.parse(JSON.stringify(originalBoard));
    const targetColumn = newBoard.columns.find(c => c.id === cardData.columnId);
    targetColumn.cards.push(newCard);
    set({ board: newBoard });
    try {
      const response = await axiosClient.post('/cards', cardData);
      targetColumn.cards = targetColumn.cards.map(c => c.id === newCard.id ? response.data : c);
      set({ board: { ...get().board, columns: newBoard.columns } });
    } catch (error) {
      console.error("Failed to add card:", error);
      set({ board: originalBoard, error: "Failed to save new card." });
    }
  },

  updateCard: async (cardData) => {
    const { id, columnId, ...dataToUpdate } = cardData;
    const originalBoard = get().board;
    const newBoard = JSON.parse(JSON.stringify(originalBoard));
    const targetColumn = newBoard.columns.find(c => c.id === columnId);
    if (!targetColumn) return;
    let targetCard = targetColumn.cards.find(c => c.id === id);
    if (!targetCard) return;

    let assigneeData = targetCard.assignee;
    if ('assigneeId' in dataToUpdate) {
      assigneeData = dataToUpdate.assigneeId ? get().members.find(m => m.User.id === dataToUpdate.assigneeId)?.User : null;
    }
    Object.assign(targetCard, { ...dataToUpdate, assignee: assigneeData });
    set({ board: newBoard });
    
    try {
      const { assigneeId, ...otherUpdates } = dataToUpdate;
      if (Object.keys(otherUpdates).length > 0) {
        await axiosClient.put(`/cards/${id}`, otherUpdates);
      }
      if ('assigneeId' in dataToUpdate) {
        await apiAssignUser(id, assigneeId);
      }
    } catch (error) {
      console.error("Failed to update card details:", error);
      set({ board: originalBoard, error: "Failed to save card changes." });
    }
  },

  deleteCard: async (cardId, columnId) => {
    const originalBoard = get().board;
    const newBoard = JSON.parse(JSON.stringify(originalBoard));
    const targetColumn = newBoard.columns.find(c => c.id === columnId);
    if (targetColumn) {
      targetColumn.cards = targetColumn.cards.filter(c => c.id !== cardId);
    }
    set({ board: newBoard });
    try {
      await apiDeleteCard(cardId);
    } catch (error) {
      console.error("Failed to delete card:", error);
      set({ board: originalBoard, error: "Failed to delete card." });
    }
  },

  addColumn: async (columnData) => {
    const originalBoard = get().board;
    const tempColumn = { ...columnData, id: `temp-col-${Date.now()}`, cards: [] };
    const newBoard = { ...originalBoard, columns: [...originalBoard.columns, tempColumn] };
    set({ board: newBoard });
    try {
      const finalColumn = await createColumn(columnData);
      newBoard.columns = newBoard.columns.map(c => c.id === tempColumn.id ? finalColumn : c);
      set({ board: { ...get().board, columns: newBoard.columns } });
    } catch (error) {
      console.error("Failed to add column:", error);
      set({ board: originalBoard, error: "Failed to save new column." });
    }
  },

  moveColumn: async (sourceIndex, destinationIndex, draggableId) => {
    const originalBoard = get().board;
    const newBoard = { ...originalBoard };
    const [movedColumn] = newBoard.columns.splice(sourceIndex, 1);
    newBoard.columns.splice(destinationIndex, 0, movedColumn);
    set({ board: newBoard });
    try {
      await apiMoveColumn(draggableId, destinationIndex);
    } catch (error) {
      console.error("Failed to move column:", error);
      set({ board: originalBoard, error: "Failed to sync column move." });
    }
  },

  deleteColumn: async (columnId) => {
    const originalBoard = get().board;
    const newBoard = { ...originalBoard, columns: originalBoard.columns.filter(c => c.id !== columnId) };
    set({ board: newBoard });
    try {
      await apiDeleteColumn(columnId);
    } catch (error) {
      console.error("Failed to delete column:", error);
      set({ board: originalBoard, error: "Failed to delete column." });
    }
  },

  setOnlineUsers: (users) => set({ onlineUsers: users }),
  handleRemoteUpdate: () => {
    if (get().board) get().fetchBoard(get().board.id);
  },
}));

export default useBoardStore;