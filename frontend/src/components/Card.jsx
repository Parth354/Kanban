import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Paperclip, Calendar, GripVertical } from 'lucide-react';
import { format, isValid } from 'date-fns';

const getPriorityStyles = (priority) => {
  switch (priority) {
    case 'high': return { indicator: 'bg-red-500', text: 'text-red-600' };
    case 'medium': return { indicator: 'bg-yellow-500', text: 'text-yellow-600' };
    case 'low': return { indicator: 'bg-green-500', text: 'text-green-600' };
    default: return { indicator: 'bg-gray-400', text: 'text-gray-500' };
  }
};

/**
 * Renders a single, draggable Kanban card.
 * @param {object} props
 * @param {object} props.card - The card object.
 * @param {number} props.index - The card's index in the column for dnd.
 * @param {function} props.onEditCard - Function to call when the card is clicked.
 */
const Card = ({ card, index, onEditCard }) => {
  // Defensive check: Don't render if the card object is missing.
  if (!card) return null;

  const priorityStyles = getPriorityStyles(card.priority);
  const dueDate = card.due_date ? new Date(card.due_date) : null;
  const isDueDateValid = dueDate && isValid(dueDate);

  return (
    <Draggable draggableId={String(card.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          // The main div is clickable, but the drag handle is a specific icon for clarity.
          onClick={() => onEditCard(card)}
          aria-label={`Task: ${card.title}`}
          className={`bg-white rounded-md p-3 mb-2 shadow-sm hover:shadow-lg hover:ring-2 hover:ring-blue-400 cursor-pointer transition-all group relative ${
            snapshot.isDragging ? 'shadow-xl ring-2 ring-blue-500' : ''
          }`}
        >
          {/* Drag Handle: Appears on hover for better UX */}
          <div {...provided.dragHandleProps} className="absolute top-2 right-1 p-1 opacity-0 group-hover:opacity-50 transition-opacity">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>

          {/* Labels */}
          {card.labels && card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {card.labels.map((label) => (
                <span
                  key={label.id}
                  style={{ backgroundColor: label.color }}
                  className="px-2 py-1 text-xs font-semibold text-white rounded-full"
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}

          {/* Priority Indicator */}
          <div className={`w-10 h-1 rounded-full mb-2 ${priorityStyles.indicator}`}></div>

          {/* Card Title */}
          <p className="font-semibold text-gray-800 break-words">{card.title}</p>

          {/* Footer with Icons and Assignee */}
          <div className="flex justify-between items-center mt-3 text-sm text-gray-600">
            <div className="flex items-center space-x-3">
              {card.attachments && card.attachments.length > 0 && (
                <span className="flex items-center" title={`${card.attachments.length} attachments`}>
                  <Paperclip className="w-4 h-4" />
                  <span className="ml-1">{card.attachments.length}</span>
                </span>
              )}
              {isDueDateValid && (
                <span className={`flex items-center font-semibold ${priorityStyles.text}`} title={`Due on ${format(dueDate, 'PPP')}`}>
                  <Calendar className="w-4 h-4" />
                  <span className="ml-1">{format(dueDate, "MMM d")}</span>
                </span>
              )}
            </div>

            {card.assignee && (
              <img
                className="w-7 h-7 rounded-full object-cover ring-2 ring-white"
                src={
                  card.assignee.avatar_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(card.assignee.name)}&background=random`
                }
                alt={card.assignee.name}
                title={`Assigned to ${card.assignee.name}`}
              />
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default Card;