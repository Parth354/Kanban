import React from 'react';
import useBoardStore from '../store/boardStore';

const PresenceAvatars = () => {
  // Get the list of online users directly from the board store
  const onlineUsers = useBoardStore((state) => state.onlineUsers);

  if (!onlineUsers || onlineUsers.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        You are the only one here.
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="flex -space-x-2 overflow-hidden">
        {onlineUsers.slice(0, 4).map((user, idx) => {
          const name = user?.name || 'Unknown';
          const avatar =
            user?.avatar_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

          return (
            <img
              key={user?.id || `online-${idx}`}
              className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
              src={avatar}
              alt={name}
              title={name}
            />
          );
        })}
      </div>
      {onlineUsers.length > 4 && (
        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600 ring-2 ring-white">
          +{onlineUsers.length - 4}
        </div>
      )}
      <span className="text-sm text-gray-600 font-medium">
        {onlineUsers.length} {onlineUsers.length > 1 ? 'people are' : 'person is'} online
      </span>
    </div>
  );
};

export default PresenceAvatars;
