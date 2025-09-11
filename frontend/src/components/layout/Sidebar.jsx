import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Trello, Users, Settings } from 'lucide-react';

const Sidebar = () => {
  const navLinkClass = ({ isActive }) =>
    `flex items-center px-4 py-2 mt-2 text-gray-200 rounded-md hover:bg-gray-700 ${
      isActive ? 'bg-gray-700' : ''
    }`;

  return (
    <div className="flex flex-col w-64 bg-gray-800 text-white">
      <div className="flex items-center justify-center h-16 border-b border-gray-700">
        <Trello className="w-8 h-8 text-blue-400" />
        <span className="ml-2 text-xl font-bold">KanbanFlow</span>
      </div>
      <nav className="flex-1 px-2 py-4">
        <NavLink to="/dashboard" className={navLinkClass}>
          <LayoutDashboard className="w-5 h-5" />
          <span className="ml-3">Dashboard</span>
        </NavLink>
        {/* Replace with a dynamic list of projects */}
        <NavLink to="/boards/1" className={navLinkClass}>
          <Trello className="w-5 h-5" />
          <span className="ml-3">Sample Project</span>
        </NavLink>
        <NavLink to="/team" className={navLinkClass}>
          <Users className="w-5 h-5" />
          <span className="ml-3">Team Members</span>
        </NavLink>
        <NavLink to="/settings" className={navLinkClass}>
          <Settings className="w-5 h-5" />
          <span className="ml-3">Settings</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;