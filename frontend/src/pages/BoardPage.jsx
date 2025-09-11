// File: src/pages/BoardPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import useBoardStore from '../store/boardStore';
import useAuthStore from '../store/authStore';
import socketService from '../services/SocketService';
import Column from '../components/Column';
import CardModal from '../components/CardModal';
import AddColumn from '../components/AddColumn';
import PresenceAvatars from '../components/PresenceAvatars';
import ManageMembersModal from '../components/ManageMembersModal';
import { Users } from 'lucide-react';

const BoardPage = () => {
  const { boardId } = useParams();
  const { user, accessToken } = useAuthStore();
  const {
    board,
    loading,
    error,
    fetchBoard,
    moveCard,
    updateCardDetails, 
    deleteCard,
    deleteColumn,
    addCard,
    moveColumn,
  } = useBoardStore();
  const [cardModalState, setCardModalState] = useState({ isOpen: false, card: null, columnId: null });
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  useEffect(() => {
    fetchBoard(boardId);
    socketService.connect(accessToken);
    socketService.joinBoard(boardId, user.id);
    return () => {
      socketService.leaveBoard(boardId, user.id);
    };
  }, [boardId, fetchBoard, user.id, accessToken]);

  const onDragEnd = (result) => {
    const { source, destination, draggableId, type } = result;
    if (!destination) return;
    if (type === 'COLUMN') {
      if (source.index !== destination.index) moveColumn(source.index, destination.index, draggableId);
      return;
    }
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    moveCard(source, destination, draggableId);
  };

  const handleOpenCreateModal = (columnId) => setCardModalState({ isOpen: true, card: null, columnId });
  const handleOpenEditModal = (card) => setCardModalState({ isOpen: true, card, columnId: card.columnId });
  const handleCloseCardModal = () => setCardModalState({ isOpen: false, card: null, columnId: null });

  const handleSaveCard = (cardData) => {
    if (cardData.id) {
      updateCardDetails(cardData); // Use the combined update/assign action
    } else {
      addCard({ ...cardData, boardId });
    }
  };

  const handleDeleteCard = (cardId, columnId) => {
    deleteCard(cardId, columnId);
  };
  
  const handleDeleteColumn = (columnId) => {
    deleteColumn(columnId);
  };

  if (loading) return <div className="p-8 text-center text-gray-600">Loading your board...</div>;
  if (error) return <div className="p-8 text-center text-red-500 font-semibold">{error}</div>;
  if (!board) return <div className="p-8 text-center text-gray-600">Sorry, we couldn't find that board.</div>;

  return (
    <>
      <div className="flex flex-col h-full bg-gray-100 overflow-hidden p-4">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h1 className="text-3xl font-bold text-gray-800">{board.title}</h1>
          <div className="flex items-center space-x-4">
            <PresenceAvatars />
            <button onClick={() => setIsMembersModalOpen(true)} className="flex items-center px-4 py-2 bg-white text-gray-700 border rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Users className="w-5 h-5 mr-2" />
              Manage Members
            </button>
          </div>
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="all-columns" direction="horizontal" type="COLUMN">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-1 items-start space-x-4 overflow-x-auto">
                {board.columns && board.columns.map((column, index) => (
                  <Column
                    key={column.id}
                    column={column}
                    cards={column.cards}
                    index={index}
                    onAddCard={handleOpenCreateModal}
                    onEditCard={handleOpenEditModal}
                    onDeleteColumn={handleDeleteColumn} // *** THE FIX IS HERE ***
                  />
                ))}
                {provided.placeholder}
                <AddColumn boardId={board.id} />
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      <CardModal
        isOpen={cardModalState.isOpen}
        onClose={handleCloseCardModal}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard} 
        cardData={cardModalState.card}
        columnId={cardModalState.columnId}
      />
      <ManageMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        boardId={boardId}
      />
    </>
  );
};

export default BoardPage;