import React, { useState, useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import useBoardStore from '../store/boardStore';

const AddColumn = ({ boardId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const addColumn = useBoardStore((state) => state.addColumn);
  const inputRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleFormSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission
    if (title.trim()) {
      addColumn({ boardId, title });
      setTitle('');
      setIsEditing(false);
    }
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="flex-shrink-0 flex items-center w-80 h-10 px-3 bg-white/20 hover:bg-white/30 rounded-lg text-white font-semibold transition-colors"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add another list
      </button>
    );
  }

  return (
    <div ref={formRef} className="flex-shrink-0 w-80 bg-gray-200 rounded-lg p-2">
      <form onSubmit={handleFormSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter list title..."
          className="w-full px-3 py-2 border border-blue-500 rounded-md focus:outline-none text-gray-800"
        />
        <div className="mt-2 flex items-center">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add list
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="ml-2 p-2 text-gray-600 hover:text-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddColumn;