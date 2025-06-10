import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const BOARD_SIZE = 15;

const PlayOnline = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { roomId, player } = location.state || {};

  const [client, setClient] = useState(null);
  const [board, setBoard] = useState(
    Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(""))
  );
  const [currentTurn, setCurrentTurn] = useState("X");
  const [winner, setWinner] = useState(null);
  const [winningCells, setWinningCells] = useState([]);
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rematchRequested, setRematchRequested] = useState(false);
  const [rematchRequestFrom, setRematchRequestFrom] = useState(null);
  const [rematchDeclined, setRematchDeclined] = useState(false);
  const [isGameFinished, setIsGameFinished] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  const findWinningCells = (board, winnerSymbol) => {
    const directions = [
      [1, 0], [0, 1], [1, 1], [1, -1],
    ];

    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c] !== winnerSymbol) continue;
        for (const [dr, dc] of directions) {
          let count = 1;
          const cells = [[r, c]];
          for (let step = 1; step < 5; step++) {
            const nr = r + dr * step;
            const nc = c + dc * step;
            if (
              nr >= 0 &&
              nr < BOARD_SIZE &&
              nc >= 0 &&
              nc < BOARD_SIZE &&
              board[nr][nc] === winnerSymbol
            ) {
              count++;
              cells.push([nr, nc]);
            } else {
              break;
            }
          }
          if (count === 5) return cells;
        }
      }
    }
    return [];
  };

  useEffect(() => {
    if (!roomId || !player) {
      navigate("/lobby");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchRoomState = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/games/get/${roomId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch room state");
        }

        const gameState = await response.json();
        setBoard(gameState.board || Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill("")));
        setCurrentTurn(gameState.currentTurn || "X");
        setWinner(gameState.winner || null);
        setPlayer1(gameState.player1 || null);
        setPlayer2(gameState.player2 || null);
        setIsGameFinished(gameState.finished || false);
        setIsLoading(false);
        setRematchRequested(gameState.player1 === player ? gameState.player1WantsRematch : gameState.player2WantsRematch);
        setRematchRequestFrom(
          gameState.player1WantsRematch && gameState.player1 !== player ? gameState.player1 :
          gameState.player2WantsRematch && gameState.player2 !== player ? gameState.player2 : null
        );

        if (gameState.winner) {
          setWinningCells(findWinningCells(gameState.board, gameState.winner));
          if (!gameState.player1WantsRematch && !gameState.player2WantsRematch) {
            setShowWinnerModal(true);
          }
        }
      } catch (error) {
        setError(`Failed to fetch room state: ${error.message}. Please try again.`);
      }
    };

    const socket = new SockJS(`http://localhost:8080/ws/game?roomId=${roomId}&token=Bearer ${token}`);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      debug: console.log,
      onConnect: () => {
        stompClient.subscribe(`/topic/game/${roomId}`, (message) => {
          const gameState = JSON.parse(message.body);
          if (gameState.message) {
            setNotification(gameState.message);
            setTimeout(() => navigate("/lobby"), 2000);
            return;
          }

          setBoard(gameState.board || Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill("")));
          setCurrentTurn(gameState.currentTurn || "X");
          setWinner(gameState.winner || null);
          setPlayer1(gameState.player1 || null);
          setPlayer2(gameState.player2 || null);
          setIsGameFinished(gameState.finished || false);
          setIsLoading(false);

          const isPlayer1 = gameState.player1 === player;
          const playerWantsRematch = isPlayer1 ? gameState.player1WantsRematch : gameState.player2WantsRematch;
          const otherPlayerWantsRematch = isPlayer1 ? gameState.player2WantsRematch : gameState.player1WantsRematch;
          const otherPlayerEmail = isPlayer1 ? gameState.player2 : gameState.player1;

          setRematchRequested(playerWantsRematch || false);
          setRematchRequestFrom(
            otherPlayerWantsRematch && otherPlayerEmail !== player ? otherPlayerEmail : null
          );

          if (gameState.winner) {
            setWinningCells(findWinningCells(gameState.board, gameState.winner));
            if (!otherPlayerWantsRematch && !playerWantsRematch) {
              setShowWinnerModal(true);
            } else {
              setShowWinnerModal(false);
            }
          } else {
            setWinningCells([]);
            setShowWinnerModal(false);
          }

          if (gameState.rematchDeclined) {
            setRematchDeclined(true);
            setWinningCells([]);
            setShowWinnerModal(false);
            setNotification("Rematch declined. Returning to lobby...");
            setTimeout(() => navigate("/lobby"), 2000);
          } else if (gameState.player1WantsRematch && gameState.player2WantsRematch) {
            setShowWinnerModal(false);
            setRematchRequested(false);
            setRematchRequestFrom(null);
            setRematchDeclined(false);
            setNotification("Starting a new game!");
            setWinner(null);
            setWinningCells([]);
            setShowWinnerModal(false);
          } else if (!gameState.finished) {
            setNotification(null);
          } else if (playerWantsRematch && !otherPlayerWantsRematch && gameState.finished) {
            setNotification("Waiting for the other player to respond...");
            setShowWinnerModal(false);
          }
        });

        stompClient.subscribe(`/topic/game/${roomId}/chat`, (message) => {
          const chatMessage = JSON.parse(message.body);
          if (chatMessage.sender !== player) {
            setMessages((prev) => [
              ...prev,
              { sender: chatMessage.sender, content: chatMessage.content, timestamp: new Date().toLocaleTimeString() },
            ]);
          }
        });

        fetchRoomState();
      },
      onStompError: (error) => {
        setError("Failed to connect to game server. Please try again.");
      },
    });

    stompClient.activate();
    setClient(stompClient);

    return () => stompClient.deactivate();
  }, [roomId, player, navigate]);

  const sendMove = (row, col) => {
    if (!client || board[row][col] || winner || !player1 || !player2) return;

    const mySymbol = player === player1 ? "X" : "O";
    if (mySymbol !== currentTurn) {
      setNotification("It's not your turn!");
      return;
    }

    client.publish({
      destination: "/app/game/move",
      body: JSON.stringify({ roomId, row, col, playerSymbol: mySymbol }),
    });
  };

  const sendChat = (e) => {
    e.preventDefault();
    if (!client || !chatInput.trim()) return;

    const timestamp = new Date().toLocaleTimeString();
    setMessages((prev) => [...prev, { sender: player, content: chatInput, timestamp }]);
    client.publish({
      destination: "/app/game/chat",
      body: JSON.stringify({ roomId, sender: player, content: chatInput }),
    });
    setChatInput("");
  };

  const leaveRoom = () => {
    if (client) {
      client.publish({
        destination: "/app/game/leave",
        body: JSON.stringify({ roomId, playerEmail: player }),
      });
    }
    setTimeout(() => navigate("/lobby"), 500);
  };

  const requestRematch = () => {
    if (!client) return;
    client.publish({
      destination: "/app/game/rematch/request",
      body: JSON.stringify({ roomId, playerEmail: player }),
    });
    setRematchRequested(true);
    setNotification("Waiting for the other player to respond...");
    setShowWinnerModal(false);
  };

  const respondToRematch = (accepted) => {
    if (!client) return;
    client.publish({
      destination: "/app/game/rematch/respond",
      body: JSON.stringify({ roomId, playerEmail: player, accepted }),
    });
    if (!accepted) {
      setRematchDeclined(true);
      setNotification("Rematch declined. Returning to lobby...");
      setTimeout(() => navigate("/lobby"), 2000);
    }
  };

  const closeWinnerModal = () => {
    setShowWinnerModal(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center bg-gray-900 text-white min-h-screen p-4">
        <h1 className="text-3xl font-bold my-4">Loading...</h1>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center min-h-screen bg-cover bg-center text-white p-6"
      style={{ backgroundImage: `url('https://img4.thuthuatphanmem.vn/uploads/2020/12/26/anh-nen-nhat-ban-2k_125909478.jpg')` }}
    >
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-5xl font-extrabold my-6 text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 animate-text-glow">
          Gomoku - Room
        </h1>
        <h2 className="text-lg font-bold text-gray-800 animate-text-reveal text-center">
          Code "{roomId}" - Share code with your friends
        </h2>
        <p className="text-xl font-bold text-blue-800 animate-text-reveal text-center">
          You are: <strong>{player}</strong> ({player === player1 ? "X" : player === player2 ? "O" : "Loading..."})
        </p>
        <p className="text-xl font-bold text-gray-900 animate-text-reveal text-center">
          Players: <strong>{player1 || "Waiting..."}</strong> (X) vs <strong>{player2 || "Waiting..."}</strong> (O)
        </p>
        <p className="text-xl font-bold text-orange-800 animate-text-reveal text-center">
          Current Turn: <strong>{currentTurn}</strong>
        </p>
        {error && <p className="text-red-400 mt-6 animate-text-reveal text-center">{error}</p>}
        {notification && (
          <p className="text-black mt-6 animate-text-reveal text-center">{notification}</p>
        )}

        {showWinnerModal && winner && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-gray-900 bg-opacity-90 p-8 rounded-xl shadow-2xl animate-modal-pop">
              <h2 className="text-4xl font-bold text-green-400 text-center mb-6">
                Winner: {winner}
              </h2>
              <div className="flex justify-center">
                <button
                  onClick={closeWinnerModal}
                  className="px-6 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {winner && !rematchRequested && !rematchDeclined && (
          <div className="flex justify-center mt-6">
            <button
              onClick={requestRematch}
              className="relative px-8 py-3 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg shadow-xl hover:from-green-600 hover:to-teal-700 transform hover:scale-110 hover:rotate-2 transition-all duration-500 group overflow-hidden"
            >
              <span className="relative z-10">Rematch</span>
              <span className="absolute inset-0 bg-green-400 opacity-0 group-hover:opacity-40 animate-pulse transition-opacity duration-500"></span>
            </button>
          </div>
        )}

        {rematchRequestFrom && !rematchRequested && !rematchDeclined && (
          <div className="mt-6 animate-fade-slide-up flex flex-col items-center">
            <p className="text-lg text-black animate-text-reveal text-center"> {/* Đổi màu thành đen */}
              {rematchRequestFrom} wants to rematch. Do you agree?
            </p>
            <div className="flex justify-center space-x-4 mt-4">
              <button
                onClick={() => respondToRematch(true)}
                className="relative px-6 py-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg shadow-xl hover:from-green-600 hover:to-teal-700 transform hover:scale-110 transition-all duration-500 group overflow-hidden"
              >
                <span className="relative z-10">Yes</span>
                <span className="absolute inset-0 bg-green-400 opacity-0 group-hover:opacity-40 animate-pulse transition-opacity duration-500"></span>
              </button>
              <button
                onClick={() => respondToRematch(false)}
                className="relative px-6 py-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg shadow-xl hover:from-red-600 hover:to-pink-700 transform hover:scale-110 transition-all duration-500 group overflow-hidden"
              >
                <span className="relative z-10">No</span>
                <span className="absolute inset-0 bg-red-400 opacity-0 group-hover:opacity-40 animate-pulse transition-opacity duration-500"></span>
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-row items-start mt-8 gap-8">
          {board && Array.isArray(board) ? (
            <div
              className="grid gap-1 bg-gray-800/80 rounded-xl p-6 shadow-2xl animate-fade-slide-up"
              style={{
                gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
                border: "2px solid #4b5563",
              }}
            >
              {board.map((row, rIdx) =>
                row.map((cell, cIdx) => {
                  const isWinningCell = winningCells.some(([wr, wc]) => wr === rIdx && wc === cIdx);
                  return (
                    <button
                      key={`${rIdx}-${cIdx}`}
                      onClick={() => sendMove(rIdx, cIdx)}
                      className={`w-12 h-12 flex items-center justify-center rounded-md shadow-lg transition-all duration-300 transform hover:scale-110 ${
                        isWinningCell
                          ? "bg-white text-black font-bold border-2 border-gray-300 animate-pulse-scale"
                          : cell === "X"
                          ? "bg-blue-600 text-white animate-pulse"
                          : cell === "O"
                          ? "bg-red-600 text-white animate-pulse"
                          : "bg-gray-700 hover:bg-gray-600 animate-bounce-in"
                      }`}
                      disabled={
                        winner ||
                        !player1 ||
                        !player2 ||
                        (player === player1 ? currentTurn !== "X" : currentTurn !== "O")
                      }
                    >
                      {cell || ""}
                    </button>
                  );
                })
              )}
            </div>
          ) : (
            <p className="text-red-400 mt-6 animate-text-reveal text-center">
              Error: Game board is not available.
            </p>
          )}

          <div className="w-full max-w-md animate-fade-slide-up flex flex-col items-center">
            <h3 className="text-2xl font-bold text-teal-400 animate-text-reveal text-center">Chat</h3>
            <div className="h-96 bg-gray-800/80 p-4 rounded-xl shadow-lg overflow-y-auto w-full">
              {messages.map((msg, idx) => (
                <p
                  key={idx}
                  className={`text-sm mb-2 ${
                    msg.sender === player
                      ? "text-right text-blue-300 animate-text-reveal"
                      : "text-left text-green-300 animate-text-reveal"
                  }`}
                >
                  <span className="text-gray-500 text-xs">[{msg.timestamp}] </span>
                  <span className="font-bold">{msg.sender}:</span> {msg.content}
                </p>
              ))}
            </div>
            <form onSubmit={sendChat} className="mt-4 flex justify-center w-full">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 p-3 bg-gray-700/80 text-white rounded-l-lg shadow-lg focus:ring-4 focus:ring-blue-500/50 focus:outline-none transform hover:scale-105 transition-all duration-500 animate-bounce-in"
                placeholder="Type a message..."
              />
              <button
                type="submit"
                className="relative px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-r-lg shadow-xl hover:from-blue-600 hover:to-indigo-700 transform hover:scale-110 transition-all duration-500 group overflow-hidden"
              >
                <span className="relative z-10">Send</span>
                <span className="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-40 animate-pulse transition-opacity duration-500"></span>
              </button>
            </form>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={leaveRoom}
            className="relative px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg shadow-xl hover:from-gray-700 hover:to-gray-800 transform hover:scale-110 hover:rotate-2 transition-all duration-500 group overflow-hidden"
          >
            <span className="relative z-10">Exit Game</span>
            <span className="absolute inset-0 bg-gray-500 opacity-0 group-hover:opacity-40 animate-pulse transition-opacity duration-500"></span>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }
        @keyframes text-glow {
          0% { text-shadow: 0 0 5px rgba(255, 255, 255, 0.5), 0 0 10px rgba(255, 255, 255, 0.3); }
          50% { text-shadow: 0 0 15px rgba(255, 255, 255, 1), 0 0 25px rgba(255, 255, 255, 0.8); }
          100% { text-shadow: 0 0 5px rgba(255, 255, 255, 0.5), 0 0 10px rgba(255, 255, 255, 0.3); }
        }
        @keyframes bounce-in {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fade-slide-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes text-reveal {
          0% { opacity: 0; filter: blur(3px); transform: translateY(10px); }
          100% { opacity: 1; filter: blur(0); transform: translateY(0); }
        }
        @keyframes pulse-scale {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        @keyframes modal-pop {
          0% { opacity: 0; transform: scale(0.8); }
          50% { transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-text-glow {
          animation: text-glow 3s ease-in-out infinite;
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
        .animate-fade-slide-up {
          animation: fade-slide-up 0.8s ease-out;
        }
        .animate-text-reveal {
          animation: text-reveal 0.7s ease-out;
        }
        .animate-pulse-scale {
          animation: pulse-scale 0.8s ease-in-out infinite;
        }
        .animate-modal-pop {
          animation: modal-pop 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PlayOnline;