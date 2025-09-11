import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import { getBoardMembers, addBoardMember, removeBoardMember } from '../api/memberService';
import { X } from 'lucide-react';

const ManageMembersModal = ({ isOpen, onClose, boardId }) => {
  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchMembers = async () => {
        setIsLoading(true);
        try {
          const fetchedMembers = await getBoardMembers(boardId);
          setMembers(fetchedMembers || []);
        } catch (err) {
          setError('Could not load members.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchMembers();
    }
  }, [isOpen, boardId]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const newMember = await addBoardMember(boardId, email);
      setMembers((prev) => [...prev, newMember]);
      setEmail('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add member.');
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await removeBoardMember(boardId, userId);
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
    } catch {
      setError('Failed to remove member.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Members">
      {/* Add Member Form */}
      <form
        onSubmit={handleAddMember}
        className="flex items-center space-x-2 mb-4 pb-4 border-b"
      >
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          className="flex-grow"
        />
        <Button type="submit">Add Member</Button>
      </form>

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      {/* Member List */}
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {isLoading ? (
          <p>Loading...</p>
        ) : members.length === 0 ? (
          <p className="text-gray-500 text-sm">No members found.</p>
        ) : (
          members.map((member, idx) => {
            // Safely access nested user info
            const user = member?.User || {};
            const name = user.name || 'Unknown';
            const email = user.email || 'No email';
            const avatar =
              user.avatar_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;

            return (
              <div
                key={member?.userId || `member-${idx}`}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <img
                    src={avatar}
                    alt={name}
                    className="w-8 h-8 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">{name}</p>
                    <p className="text-sm text-gray-500">{email}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-3 capitalize">
                    {member?.role || 'member'}
                  </span>
                  {member?.role !== 'admin' && (
                    <button
                      onClick={() => handleRemoveMember(member.userId)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
};

export default ManageMembersModal;
