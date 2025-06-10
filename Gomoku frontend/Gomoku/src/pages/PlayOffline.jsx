import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function App() {
  const navigate = useNavigate();
  const size = 15;
  const [board, setBoard] = useState(Array(size * size).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const winner = calculateWinner(board, size);
  const winningCells = winner ? findWinningCells(board, size, winner) : [];
  const isDraw = !winner && board.every((cell) => cell !== null);

  function handleClick(index) {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? "X" : "O";
    setBoard(newBoard);
    setIsXNext(!isXNext);

    if (!calculateWinner(newBoard, size) && newBoard.every((cell) => cell !== null)) {
      alert("It's a Draw!");
    }
  }

  function resetGame() {
    setBoard(Array(size * size).fill(null));
    setIsXNext(true);
  }

  function calculateWinner(board, size) {
    const directions = [
      [1, 0], [0, 1], [1, 1], [1, -1],
    ];

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const start = row * size + col;
        if (!board[start]) continue;

        for (const [dx, dy] of directions) {
          let count = 1;
          for (let step = 1; step < 5; step++) {
            const x = row + dx * step;
            const y = col + dy * step;
            if (x < 0 || x >= size || y < 0 || y >= size) break;
            if (board[x * size + y] === board[start]) {
              count++;
            } else {
              break;
            }
          }
          if (count === 5) return board[start];
        }
      }
    }
    return null;
  }

  function findWinningCells(board, size, winner) {
    const directions = [
      [1, 0], [0, 1], [1, 1], [1, -1],
    ];

    const winningCells = [];
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const start = row * size + col;
        if (!board[start] || board[start] !== winner) continue;

        for (const [dx, dy] of directions) {
          let count = 1;
          const cells = [start];
          for (let step = 1; step < 5; step++) {
            const x = row + dx * step;
            const y = col + dy * step;
            if (x < 0 || x >= size || y < 0 || y >= size) break;
            const next = x * size + y;
            if (board[next] === board[start]) {
              count++;
              cells.push(next);
            } else {
              break;
            }
          }
          if (count === 5) return cells;
        }
      }
    }
    return winningCells;
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center text-white p-6"
      style={{
        backgroundImage: `url('https://png.pngtree.com/thumb_back/fw800/background/20241012/pngtree-a-painting-of-japanese-landscape-with-cherry-blossom-trees-and-temple-image_16367157.jpg')`,
      }}
    >
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-600 animate-title-shimmer">
          Gomoku Offline
        </h1>
        <div
          className="grid gap-1 p-6 bg-gray-800/80 rounded-xl shadow-2xl animate-board-rise"
          style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
        >
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleClick(index)}
              className={`w-12 h-12 text-2xl font-bold flex items-center justify-center rounded-md shadow-lg transition-all duration-300 transform hover:scale-110 ${
                winningCells.includes(index)
                  ? "bg-white text-black font-bold border-2 border-gray-300 animate-pulse"
                  : cell === "X"
                  ? "bg-blue-600 text-white animate-cell-pop"
                  : cell === "O"
                  ? "bg-red-600 text-white animate-cell-pop"
                  : "bg-gray-700 hover:bg-gray-600 animate-cell-slide"
              }`}
            >
              {cell}
            </button>
          ))}
        </div>

        {(winner || isDraw) && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-gray-900 bg-opacity-90 p-8 rounded-xl shadow-2xl animate-fade-in">
              <h2 className="text-4xl font-bold text-center mb-4">
                {winner ? (
                  <span className="text-green-400">{winner} Wins!</span>
                ) : (
                  <span className="text-yellow-400">It’s a Draw!</span>
                )}
              </h2>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={resetGame}
                  className="px-6 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition-all duration-300"
                >
                  Play Again
                </button>
                <button
                  onClick={() => navigate("/main")}
                  className="px-6 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-all duration-300"
                >
                  Back to Main
                </button>
              </div>
            </div>
          </div>
        )}

        {!winner && !isDraw && (
          <div className="flex justify-center space-x-4 mt-8">
            <button
              onClick={resetGame}
              className="relative px-8 py-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg shadow-xl hover:from-red-600 hover:to-pink-700 transform hover:scale-110 hover:rotate-2 transition-all duration-500 group overflow-hidden animate-button-pop"
            >
              <span className="relative z-10">Reset Game</span>
              <span className="absolute inset-0 bg-red-400 opacity-0 group-hover:opacity-40 animate-pulse-ring transition-opacity duration-500"></span>
            </button>
            <button
              onClick={() => navigate("/main")}
              className="relative px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-xl hover:from-blue-600 hover:to-indigo-700 transform hover:scale-110 hover:rotate-2 transition-all duration-500 group overflow-hidden animate-button-pop"
            >
              <span className="relative z-10">Back</span>
              <span className="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-40 animate-pulse-ring transition-opacity duration-500"></span>
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes title-shimmer {
          0% { text-shadow: 0 0 5px rgba(0, 255, 255, 0.5), 0 0 10px rgba(0, 255, 255, 0.3); }
          50% { text-shadow: 0 0 15px rgba(0, 255, 255, 1), 0 0 25px rgba(0, 255, 255, 0.8); }
          100% { text-shadow: 0 0 5px rgba(0, 255, 255, 0.5), 0 0 10px rgba(0, 255, 255, 0.3); }
        }
        @keyframes board-rise {
          0% { opacity: 0; transform: translateY(30px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes cell-pop {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes cell-slide {
          0% { opacity: 0; transform: translateX(-20px); }
          50% { opacity: 0.5; transform: translateX(10px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes result-fade {
          0% { opacity: 0; filter: blur(3px); transform: translateY(10px); }
          100% { opacity: 1; filter: blur(0); transform: translateY(0); }
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
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        @keyframes fade-in {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-title-shimmer {
          animation: title-shimmer 3s ease-in-out infinite;
        }
        .animate-board-rise {
          animation: board-rise 0.8s ease-out;
        }
        .animate-cell-pop {
          animation: cell-pop 0.5s ease-out;
        }
        .animate-cell-slide {
          animation: cell-slide 0.5s ease-out;
        }
        .animate-result-fade {
          animation: result-fade 0.7s ease-out;
        }
        .animate-button-pop {
          animation: button-pop 0.6s ease-out;
        }
        .animate-pulse-ring {
          animation: pulse-ring 1s ease-out infinite;
        }
        .animate-pulse {
          animation: pulse 0.8s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}