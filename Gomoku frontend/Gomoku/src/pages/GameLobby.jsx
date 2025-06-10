  import { useState, useEffect } from "react";
  import { useNavigate } from "react-router-dom";

  const GameLobby = () => {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState("");
    const [message, setMessage] = useState("");
    const [playerEmail, setPlayerEmail] = useState(null);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [token, setToken] = useState(null); // Lưu token để sử dụng trong interval

    useEffect(() => {
      const email = localStorage.getItem("userEmail");
      const tokenFromStorage = localStorage.getItem("token");
      console.log("GameLobby: Checking localStorage:");
      console.log("userEmail:", email);
      console.log("token:", tokenFromStorage);

      if (!email || !tokenFromStorage) {
        console.log("No email or token found, redirecting to /login");
        navigate("/login");
        return;
      }

      setPlayerEmail(email);
      setToken(tokenFromStorage);

      // Gọi lần đầu tiên ngay khi component mount
      fetchAvailableRooms(tokenFromStorage);

      // Thiết lập interval để cập nhật danh sách phòng mỗi 2 giây
      const intervalId = setInterval(() => {
        console.log("Fetching available rooms every 2 seconds...");
        fetchAvailableRooms(tokenFromStorage);
      }, 2000);

      // Dọn dẹp interval khi component unmount
      return () => {
        console.log("Cleaning up interval...");
        clearInterval(intervalId);
      };
    }, [navigate]); // Dependency chỉ có navigate vì token không thay đổi trong component này

    const fetchAvailableRooms = async (token) => {
      try {
        console.log("Fetching available rooms with token:", token);
        const response = await fetch("http://localhost:8080/api/games/list", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Response status:", response.status);
        if (!response.ok) {
          const errorData = await response.json();
          console.log("Error response:", errorData);
          throw new Error(errorData.message || "Failed to fetch available rooms");
        }

        const data = await response.json();
        console.log("Available rooms:", data);
        setAvailableRooms(data);
      } catch (error) {
        console.error("Error fetching available rooms:", error);
        setMessage(error.message);
      }
    };

    const createRoom = async () => {
      if (!playerEmail) {
        setMessage("Please log in to create a room.");
        return;
      }

      const newRoomId = "room-" + Math.floor(Math.random() * 10000);
      try {
        if (!token) {
          throw new Error("No token found. Please log in again.");
        }

        const response = await fetch("http://localhost:8080/api/games/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ roomId: newRoomId, player1: playerEmail }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create room");
        }

        const data = await response.json();
        navigate(`/playonline`, { state: { roomId: data.roomId, player: playerEmail } });
      } catch (error) {
        console.error("Error creating room:", error);
        setMessage(error.message);
      }
    };

    const joinRoom = async (id = roomId) => {
      if (!playerEmail) {
        setMessage("Please log in to join a room.");
        return;
      }
      if (!id) {
        setMessage("Please enter a valid room ID.");
        return;
      }

      try {
        if (!token) {
          throw new Error("No token found. Please log in again.");
        }

        const response = await fetch("http://localhost:8080/api/games/join", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ roomId: id, player2: playerEmail }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to join room");
        }

        navigate(`/playonline`, { state: { roomId: id, player: playerEmail } });
      } catch (error) {
        console.error("Error joining room:", error);
        setMessage(error.message);
      }
    };

    return (
      <div className="flex flex-col items-center min-h-screen bg-cover bg-center text-white p-6" style={{ backgroundImage: `url('https://cdnb.artstation.com/p/assets/images/images/034/591/187/large/yurinatume-.jpg?1612711740')` }}>
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 to-gray-800/50 animate-gradient-shift"></div>
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-5xl font-extrabold my-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-600 animate-text-glow">
          Game Lobby
        </h1>

        <div className="flex justify-center mb-6">
          <button
            onClick={createRoom}
            className="relative px-8 py-3 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg shadow-xl hover:from-green-600 hover:to-teal-700 transform hover:scale-110 hover:rotate-2 transition-all duration-500 group overflow-hidden"
          >
            <span className="relative z-10">Create Room</span>
            <span className="absolute inset-0 bg-green-400 opacity-0 group-hover:opacity-40 animate-pulse transition-opacity duration-500"></span>
          </button>
        </div>

        <div className="w-full max-w-lg mt-8 animate-fade-slide-up">
          <h3 className="text-2xl font-bold text-teal-400 animate-text-reveal text-center">Available Rooms</h3>
          {availableRooms.length > 0 ? (
            <ul className="mt-4 space-y-4">
              {availableRooms.map((room) => (
                <li key={room.roomId} className="flex justify-between items-center p-4 bg-gray-800/80 rounded-lg shadow-lg hover:bg-gray-700/80 transform hover:scale-105 transition-all duration-300 animate-fade-slide-up">
                  <span className="text-gray-200">
                    Room: {room.roomId} (Player 1: {room.player1})
                  </span>
                  <button
                    onClick={() => joinRoom(room.roomId)}
                    className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transform hover:scale-110 transition-all duration-300"
                  >
                    Join
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 mt-4 animate-text-reveal text-center">No available rooms.</p>
          )}
        </div>

        <div className="flex flex-col items-center mt-6">
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-64 px-4 py-3 bg-gray-700/80 text-white rounded-lg shadow-lg focus:ring-4 focus:ring-blue-500/50 focus:outline-none transform hover:scale-105 transition-all duration-500 animate-bounce-in"
          />
          <div className="flex justify-center mt-4">
            <button
              onClick={() => joinRoom()}
              className="relative px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-xl hover:from-blue-600 hover:to-indigo-700 transform hover:scale-110 hover:rotate-2 transition-all duration-500 group overflow-hidden"
            >
              <span className="relative z-10">Join Room</span>
              <span className="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-40 animate-pulse transition-opacity duration-500"></span>
            </button>
          </div>
        </div>

        {message && <p className="text-red-400 mt-6 animate-text-reveal text-center">{message}</p>}

        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate("/main")}
            className="relative px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg shadow-xl hover:from-gray-700 hover:to-gray-800 transform hover:scale-110 hover:rotate-2 transition-all duration-500 group overflow-hidden"
          >
            <span className="relative z-10">Go Back</span>
            <span className="absolute inset-0 bg-gray-500 opacity-0 group-hover:opacity-40 animate-pulse transition-opacity duration-500"></span>
          </button>
        </div>
      </div>
      <style jsx>{`
        @keyframes background-flow {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }
        @keyframes title-shimmer {
          0% { text-shadow: 0 0 5px rgba(0, 255, 255, 0.5), 0 0 10px rgba(0, 255, 255, 0.3); }
          50% { text-shadow: 0 0 15px rgba(0, 255, 255, 1), 0 0 25px rgba(0, 255, 255, 0.8); }
          100% { text-shadow: 0 0 5px rgba(0, 255, 255, 0.5), 0 0 10px rgba(0, 255, 255, 0.3); }
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
        @keyframes content-rise {
          0% { opacity: 0; transform: translateY(30px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes text-fade {
          0% { opacity: 0; filter: blur(3px); transform: translateY(10px); }
          100% { opacity: 1; filter: blur(0); transform: translateY(0); }
        }
        @keyframes input-slide {
          0% { opacity: 0; transform: translateX(-20px); }
          50% { opacity: 0.5; transform: translateX(10px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .animate-background-flow {
          background-size: 300% 300%;
          animation: background-flow 20s ease infinite;
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
        .animate-content-rise {
          animation: content-rise 0.8s ease-out;
        }
        .animate-text-fade {
          animation: text-fade 0.7s ease-out;
        }
        .animate-input-slide {
          animation: input-slide 0.5s ease-out;
        }
      `}</style>
    </div>
    );
  };

  export default GameLobby;