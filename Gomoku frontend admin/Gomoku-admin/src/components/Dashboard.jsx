import React, { useState } from 'react';
import UserTab from './UserTab';
import GameRoomTab from './GameRoomTab';

const Dashboard = ({ setIsLoggedIn }) => {
  const [activeTab, setActiveTab] = useState('users');

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
          Gomoku Admin Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2 rounded-lg font-semibold shadow-md hover:from-red-600 hover:to-red-700 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:scale-95"
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 rounded-lg font-medium shadow-sm transform transition-all duration-300 ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white scale-105 shadow-md'
              : 'bg-white text-gray-700 hover:bg-blue-100 hover:shadow-md'
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('gameRooms')}
          className={`px-6 py-3 rounded-lg font-medium shadow-sm transform transition-all duration-300 ${
            activeTab === 'gameRooms'
              ? 'bg-blue-600 text-white scale-105 shadow-md'
              : 'bg-white text-gray-700 hover:bg-blue-100 hover:shadow-md'
          }`}
        >
          Game Rooms
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300">
        {activeTab === 'users' ? <UserTab /> : <GameRoomTab />}
      </div>
    </div>
  );
};

export default Dashboard;