import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import Card from './Card';
import { Plus, Trash2 } from 'lucide-react';

const Column = ({ column, cards = [], index, onAddCard, onEditCard, onDeleteColumn }) => {
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the "${column.title}" list? All cards within it will also be deleted.`)) {
      onDeleteColumn(column.id);
    }
  };

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className="flex flex-col w-80 bg-gray-200 rounded-lg p-2 flex-shrink-0 h-full"
        >
          {/* Column Header */}
          <div
            {...provided.dragHandleProps}
            className="flex items-center justify-between font-bold text-lg mb-2 px-2 text-gray-700 cursor-grab"
          >
            <span className="flex-1 truncate pr-2">{column.title}</span>
            <button
              onClick={handleDelete}
              className="p-1 rounded-md hover:bg-gray-300 text-gray-500 hover:text-red-600 transition-colors"
              aria-label={`Delete column ${column.title}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Cards Area */}
          <div className="flex-1 overflow-y-auto">
            <Droppable droppableId={column.id} type="CARD">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[100px] rounded-lg transition-colors p-1 ${
                    snapshot.isDraggingOver ? 'bg-blue-100' : 'bg-gray-200'
                  }`}
                >
                  {cards.map((card, idx) => (
                    <Card
                      key={card.id}
                      card={card}
                      index={idx}
                      onEditCard={onEditCard}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* Add Card Button */}
          <button
            onClick={() => onAddCard(column.id)}
            className="mt-2 flex items-center justify-start w-full p-2 text-gray-600 hover:bg-gray-300 rounded-md flex-shrink-0 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span>Add a card</span>
          </button>
        </div>
      )}
    </Draggable>
  );
};

export default Column;