// File: src/components/CardModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Button from './ui/Button';
import useBoardStore from '../store/boardStore';

const CardModal = ({ isOpen, onClose, onSave, onDelete, cardData, columnId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [assigneeId, setAssigneeId] = useState(null);
  
  const members = useBoardStore((state) => state.members);
  const isEditing = !!cardData;

  useEffect(() => {
    if (isOpen) {
      if (isEditing && cardData) {
        setTitle(cardData.title || '');
        setDescription(cardData.description || '');
        setPriority(cardData.priority || 'medium');
        setAssigneeId(cardData.assignee?.id || null);
      } else {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setAssigneeId(null);
      }
    }
  }, [isOpen, cardData, isEditing]);

  const handleSave = () => {
    if (!title.trim()) return alert('Title is required.');
    onSave({
      id: isEditing ? cardData.id : undefined,
      title,
      description,
      priority,
      assigneeId,
      columnId: isEditing ? cardData.columnId : columnId,
    });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this card? This action cannot be undone.")) {
      onDelete(cardData.id, cardData.columnId);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Card' : 'Create New Card'}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Design the login page" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add a more detailed description..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
          <select value={assigneeId || ''} onChange={(e) => setAssigneeId(e.target.value || null)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
            <option value="">Unassigned</option>
            {members && members.filter(member => member && member.User).map(member => (
              <option key={member.User.id} value={member.User.id}>
                {member.User.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-between items-center mt-6 pt-4 border-t">
        <div>
          {isEditing && (
            <Button variant="danger" onClick={handleDelete}>Delete Card</Button>
          )}
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>
            {isEditing ? 'Save Changes' : 'Create Card'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CardModal;