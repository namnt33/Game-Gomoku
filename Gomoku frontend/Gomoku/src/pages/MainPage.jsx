import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from "../services/authService";

const MainPage = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const token = localStorage.getItem("token");
    if (!email || !token) {
      navigate("/login");
    } else {
      setUserEmail(email);
      setIsLoggedIn(true);
    }
  }, [navigate]);

  const handleLogout = () => {
    logoutUser();
    setIsLoggedIn(false);
    setUserEmail(null);
    navigate("/login");
  };

  const handlePlayOnline = () => {
    if (!isLoggedIn) {
      alert("Please log in to play online!");
      navigate("/login");
      return;
    }
    navigate("/lobby");
  };

  const handlePlayOffline = () => navigate("/playoffline");
  const handlePlayWithAI = () => navigate("/playai");
  const handleRules = () => navigate("/rules");
  const handleProfile = () => navigate("/profile");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center text-white p-6" style={{ backgroundImage: `url('https://wallpaperaccess.com/full/2346357.jpg')` }}>
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-gray-800/50 animate-gradient-shift"></div>
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 animate-text-glow">
          Welcome to Gomoku Game
        </h1>
        {isLoggedIn && userEmail && (
          <p className="mb-6 text-lg text-gray-200 animate-text-reveal text-center">
            Logged in as: <strong className="text-teal-400">{userEmail}</strong>
          </p>
        )}
        <div className="flex flex-col space-y-6 w-full max-w-sm items-center">
          <button onClick={handlePlayOffline} className="relative w-full px-8 py-4 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg shadow-xl hover:from-green-600 hover:to-teal-700 transform hover:scale-110 hover:rotate-2 transition-all duration-500 group overflow-hidden animate-bounce-in">
            <span className="relative z-10">Play Offline</span>
            <span className="absolute inset-0 bg-green-400 opacity-0 group-hover:opacity-40 animate-pulse transition-opacity duration-500"></span>
          </button>
          <button onClick={handlePlayOnline} className="relative w-full px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg shadow-xl hover:from-yellow-600 hover:to-orange-700 transform hover:scale-110 hover:rotate-2 transition-all duration-500 group overflow-hidden animate-bounce-in">
            <span className="relative z-10">Play Online</span>
            <span className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-40 animate-pulse transition-opacity duration-500"></span>
          </button>
          <button onClick={handlePlayWithAI} className="relative w-full px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg shadow-xl hover:from-red-600 hover:to-pink-700 transform hover:scale-110 hover:rotate-2 transition-all duration-500 group overflow-hidden animate-bounce-in">
            <span className="relative z-10">Play With AI</span>
            <span className="absolute inset-0 bg-red-400 opacity-0 group-hover:opacity-40 animate-pulse transition-opacity duration-500"></span>
          </button>
          <button onClick={handleRules} className="relative w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-xl hover:from-blue-600 hover:to-indigo-700 transform hover:scale-110 hover:rotate-2 transition-all duration-500 group overflow-hidden animate-bounce-in">
            <span className="relative z-10">How to Play Gomoku Game</span>
            <span className="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-40 animate-pulse transition-opacity duration-500"></span>
          </button>
          <button onClick={handleProfile} className="relative w-full px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-xl hover:from-purple-600 hover:to-indigo-700 transform hover:scale-110 hover:rotate-2 transition-all duration-500 group overflow-hidden animate-bounce-in">
            <span className="relative z-10">Profile</span>
            <span className="absolute inset-0 bg-purple-400 opacity-0 group-hover:opacity-40 animate-pulse transition-opacity duration-500"></span>
          </button>
          {isLoggedIn && (
            <button onClick={handleLogout} className="relative w-full px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg shadow-xl hover:from-gray-700 hover:to-gray-800 transform hover:scale-110 hover:rotate-2 transition-all duration-500 group overflow-hidden animate-bounce-in">
              <span className="relative z-10">Logout</span>
              <span className="absolute inset-0 bg-gray-500 opacity-0 group-hover:opacity-40 animate-pulse transition-opacity duration-500"></span>
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes text-glow {
          0%, 100% { text-shadow: 0 0 10px rgba(96, 165, 250, 0.8); }
          50% { text-shadow: 0 0 20px rgba(147, 51, 234, 1); }
        }
        @keyframes bounce-in {
          0% { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes text-reveal {
          0% { opacity: 0; filter: blur(5px); }
          100% { opacity: 1; filter: blur(0); }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }
        .animate-text-glow {
          animation: text-glow 2s ease-in-out infinite;
        }
        .animate-bounce-in {
          animation: bounce-in 0.8s ease-out;
        }
        .animate-text-reveal {
          animation: text-reveal 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MainPage;