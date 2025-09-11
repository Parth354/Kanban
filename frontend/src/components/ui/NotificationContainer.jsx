import React from 'react';
import useNotificationStore from '../../store/notificationStore';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const icons = {
  success: <CheckCircle className="w-6 h-6 text-green-500" />,
  error: <XCircle className="w-6 h-6 text-red-500" />,
  info: <Info className="w-6 h-6 text-blue-500" />,
};

const bgColors = {
  success: 'bg-green-50',
  error: 'bg-red-50',
  info: 'bg-blue-50',
}

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed top-5 right-5 z-50 space-y-3">
      {notifications.map(note => (
        <div
          key={note.id}
          className={`relative max-w-sm w-full ${bgColors[note.type]} shadow-lg rounded-lg pointer-events-auto flex items-center p-4 ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-shrink-0">{icons[note.type]}</div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">{note.message}</p>
          </div>
          <button
            onClick={() => removeNotification(note.id)}
            className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;