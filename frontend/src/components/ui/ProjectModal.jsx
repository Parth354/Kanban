import React, { useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import Textarea from './Textarea';
import Button from './Button';

const ProjectModal = ({ isOpen, onClose, onSave, isLoading }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (!title) {
      alert('Project title is required.');
      return;
    }
    // The onSave function will receive the project data
    onSave({ title, description });
  };

  const handleClose = () => {
    // Reset form state when closing
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Project">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Title
          </label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Q4 Marketing Campaign"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a short description of the project..."
          />
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProjectModal;