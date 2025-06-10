import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center text-white p-6" style={{ backgroundImage: `url('https://png.pngtree.com/background/20230518/original/pngtree-japanese-landscape-from-kyoto-picture-image_2645768.jpg')` }}>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-indigo-900/50 animate-gradient-flow"></div>
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600 animate-title-shimmer">
          Welcome to Gomoku Game
        </h1>
        <div className="flex flex-col space-y-6 w-full max-w-sm items-center">
          <button
            onClick={() => navigate("/login")}
            className="relative w-full px-8 py-4 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg shadow-xl hover:from-green-600 hover:to-teal-700 transform hover:scale-110 hover:rotate-2 transition-all duration-500 group overflow-hidden animate-button-pop"
          >
            <span className="relative z-10">Login</span>
            <span className="absolute inset-0 bg-green-400 opacity-0 group-hover:opacity-40 animate-pulse-ring transition-opacity duration-500"></span>
          </button>
          <button
            onClick={() => navigate("/register")}
            className="relative w-full px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg shadow-xl hover:from-yellow-600 hover:to-orange-700 transform hover:scale-110 hover:rotate-2 transition-all duration-500 group overflow-hidden animate-button-pop"
          >
            <span className="relative z-10">Register</span>
            <span className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-40 animate-pulse-ring transition-opacity duration-500"></span>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-flow {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }
        @keyframes title-shimmer {
          0% { text-shadow: 0 0 5px rgba(129, 140, 248, 0.5), 0 0 10px rgba(129, 140, 248, 0.3); }
          50% { text-shadow: 0 0 15px rgba(147, 51, 234, 1), 0 0 25px rgba(147, 51, 234, 0.8); }
          100% { text-shadow: 0 0 5px rgba(129, 140, 248, 0.5), 0 0 10px rgba(129, 140, 248, 0.3); }
        }
        @keyframes button-pop {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.9); opacity: 0; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 0; }
        }
        .animate-gradient-flow {
          background-size: 300% 300%;
          animation: gradient-flow 20s ease infinite;
        }
        .animate-title-shimmer {
          animation: title-shimmer 3s ease-in-out infinite;
        }
        .animate-button-pop {
          animation: button-pop 0.6s ease-out;
        }
        .animate-pulse-ring {
          animation: pulse-ring 1s ease-out infinite;
        }
      `}</style>
    </div>
  );
};

export default HomePage;