import React from 'react';
import { Link } from 'react-router-dom';
import { Trello, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ProjectCard = ({ board }) => {
  return (
    <Link 
      to={`/boards/${board.id}`} 
      className="block bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="flex items-center mb-2">
        <Trello className="w-5 h-5 text-blue-500 mr-3" />
        <h3 className="text-lg font-bold text-gray-800 truncate">{board.title}</h3>
      </div>
      <p className="text-gray-600 text-sm mb-4 h-10 overflow-hidden">
        {board.description || 'No description provided.'}
      </p>
      <div className="border-t pt-3 flex justify-between items-center text-xs text-gray-500">
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          <span>Updated {formatDistanceToNow(new Date(board.updatedAt), { addSuffix: true })}</span>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;