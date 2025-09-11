import React from 'react';
import useAuthStore from '../../store/authStore';
import { Search, Bell } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuthStore();

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white border-b">
      <div className="flex items-center">
        <Search className="w-5 h-5 text-gray-500" />
        <input
          className="ml-4 text-sm focus:outline-none"
          type="text"
          placeholder="Search tasks..."
        />
      </div>
      <div className="flex items-center">
        <Bell className="w-6 h-6 text-gray-600 mr-4 cursor-pointer" />
        <div className="flex items-center">
          <img
            className="w-8 h-8 rounded-full object-cover"
            src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.name}&background=random`}
            alt="avatar"
          />
          <span className="ml-2 font-semibold">{user?.name}</span>
          <button onClick={logout} className="ml-4 text-sm text-gray-600 hover:text-blue-500">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;