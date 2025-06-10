import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

class GomokuAI {
  constructor(size = 15, difficulty = "hard") {
    this.size = size;
    this.difficulty = difficulty; // Thêm thuộc tính độ khó
    this.qTable = {};
    this.learningRate = 0.1;
    this.discountFactor = 0.9;
    this.epsilon = 0.1;
  }

  loadQTable(qTableData) {
    this.qTable = qTableData || {};
  }

  saveQTable() {}

  boardToState(board) {
    return board.map(cell => (cell === null ? "0" : cell === "X" ? "1" : "2")).join("");
  }

  to2DArray(board) {
    const board2D = [];
    for (let i = 0; i < this.size; i++) {
      board2D.push(board.slice(i * this.size, (i + 1) * this.size));
    }
    return board2D;
  }

  evaluateLine(line, player) {
    let score = 0;
    for (let i = 0; i <= line.length - 5; i++) {
      const window = line.slice(i, i + 5);
      const playerCount = window.filter(cell => cell === player).length;
      const noneCount = window.filter(cell => cell === null).length;

      if (playerCount === 5) score += 1000000;
      else if (playerCount === 4 && noneCount === 1) score += 100000;
      else if (playerCount === 3 && noneCount === 2) score += 1000;
      else if (playerCount === 2 && noneCount === 3) score += 100;
    }
    return score;
  }

  evaluateBoard(board, player, opponent) {
    let score = 0;
    const board2D = this.to2DArray(board);
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        for (const [di, dj] of directions) {
          const line = [];
          for (let k = -4; k < 5; k++) {
            const ni = i + k * di;
            const nj = j + k * dj;
            if (ni >= 0 && ni < this.size && nj >= 0 && nj < this.size) {
              line.push(board2D[ni][nj]);
            } else {
              line.push(null);
            }
          }
          score += this.evaluateLine(line, player);
          score -= this.evaluateLine(line, opponent) * 1.2;
        }
      }
    }
    return score;
  }

  getPotentialMoves(board) {
    const potentialMoves = new Set();
    const board2D = this.to2DArray(board);
    const range = this.difficulty === "hardcore" ? 2 : 1; // Mở rộng phạm vi tìm kiếm cho hardcore

    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (board2D[i][j] !== null) {
          for (let di = -range; di <= range; di++) {
            for (let dj = -range; dj <= range; dj++) {
              const ni = i + di;
              const nj = j + dj;
              if (ni >= 0 && ni < this.size && nj >= 0 && nj < this.size && board2D[ni][nj] === null) {
                potentialMoves.add(ni * this.size + nj);
              }
            }
          }
        }
      }
    }
    return potentialMoves.size > 0
      ? Array.from(potentialMoves)
      : board.map((cell, i) => (cell === null ? i : null)).filter(i => i !== null);
  }

  findDefensiveMove(board, opponent, player) {
    const board2D = this.to2DArray(board);
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    let openThreeMove = null;

    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        for (const [di, dj] of directions) {
          const line = [];
          const positions = [];
          for (let k = -4; k < 5; k++) {
            const ni = i + k * di;
            const nj = j + k * dj;
            if (ni >= 0 && ni < this.size && nj >= 0 && nj < this.size) {
              line.push(board2D[ni][nj]);
              positions.push(ni * this.size + nj);
            } else {
              line.push(null);
              positions.push(null);
            }
          }

          for (let idx = 0; idx <= line.length - 5; idx++) {
            const window = line.slice(idx, idx + 5);
            const opponentCount = window.filter(cell => cell === opponent).length;
            const noneCount = window.filter(cell => cell === null).length;

            if (opponentCount === 4 && noneCount === 1) {
              const emptyIdx = window.indexOf(null) + idx;
              if (positions[emptyIdx] !== null) return positions[emptyIdx];
            } else if (opponentCount === 3 && noneCount === 2) {
              const emptyPositions = positions.slice(idx, idx + 5).filter((pos, k) => window[k] === null && pos !== null);
              const windowSlice = window;

              const leftBlocked = idx > 0 && line[idx - 1] !== null && line[idx - 1] !== opponent;
              const rightBlocked = idx + 5 < line.length && line[idx + 5] !== null && line[idx + 5] !== opponent;

              if (!leftBlocked && !rightBlocked && emptyPositions.length === 2) {
                for (let k = 0; k < windowSlice.length - 1; k++) {
                  if (windowSlice[k] === opponent && windowSlice[k + 1] === null) {
                    return positions[idx + k + 1];
                  }
                  if (windowSlice[k] === null && windowSlice[k + 1] === opponent) {
                    return positions[idx + k];
                  }
                }
              } else if (!openThreeMove) {
                for (let k = 0; k < windowSlice.length - 1; k++) {
                  if (windowSlice[k] === opponent && windowSlice[k + 1] === null) {
                    openThreeMove = positions[idx + k + 1];
                    break;
                  }
                  if (windowSlice[k] === null && windowSlice[k + 1] === opponent) {
                    openThreeMove = positions[idx + k];
                    break;
                  }
                }
              }
            }
          }
        }
      }
    }
    return openThreeMove;
  }

  findAttackingMove(board, player, opponent) {
    const board2D = this.to2DArray(board);
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    let openThreeMove = null;

    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        for (const [di, dj] of directions) {
          const line = [];
          const positions = [];
          for (let k = -4; k < 5; k++) {
            const ni = i + k * di;
            const nj = j + k * dj;
            if (ni >= 0 && ni < this.size && nj >= 0 && nj < this.size) {
              line.push(board2D[ni][nj]);
              positions.push(ni * this.size + nj);
            } else {
              line.push(null);
              positions.push(null);
            }
          }

          for (let idx = 0; idx <= line.length - 5; idx++) {
            const window = line.slice(idx, idx + 5);
            const playerCount = window.filter(cell => cell === player).length;
            const noneCount = window.filter(cell => cell === null).length;

            if (playerCount === 4 && noneCount === 1) {
              const leftBlocked = idx > 0 && line[idx - 1] !== null && line[idx - 1] !== player;
              const rightBlocked = idx + 5 < line.length && line[idx + 5] !== null && line[idx + 5] !== player;
              const emptyIdx = window.indexOf(null) + idx;

              if ((!leftBlocked || !rightBlocked) && positions[emptyIdx] !== null) {
                return positions[emptyIdx];
              }
            } else if (playerCount === 3 && noneCount === 2) {
              const emptyPositions = positions.slice(idx, idx + 5).filter((pos, k) => window[k] === null && pos !== null);
              const windowSlice = window;

              const leftBlocked = idx > 0 && line[idx - 1] !== null && line[idx - 1] !== player;
              const rightBlocked = idx + 5 < line.length && line[idx + 5] !== null && line[idx + 5] !== player;

              if (!leftBlocked && !rightBlocked && emptyPositions.length === 2) {
                for (let k = 0; k < windowSlice.length - 1; k++) {
                  if (windowSlice[k] === player && windowSlice[k + 1] === null) {
                    return positions[idx + k + 1];
                  }
                  if (windowSlice[k] === null && windowSlice[k + 1] === player) {
                    return positions[idx + k];
                  }
                }
              } else if (!openThreeMove) {
                for (let k = 0; k < windowSlice.length - 1; k++) {
                  if (windowSlice[k] === player && windowSlice[k + 1] === null) {
                    openThreeMove = positions[idx + k + 1];
                    break;
                  }
                  if (windowSlice[k] === null && windowSlice[k + 1] === player) {
                    openThreeMove = positions[idx + k];
                    break;
                  }
                }
              }
            }
          }
        }
      }
    }
    return openThreeMove;
  }

  getBestMove(board, player = "X", opponent = "O") {
    console.log(`AI is calculating move (Difficulty: ${this.difficulty})...`);
    const potentialMoves = this.getPotentialMoves(board);

    // Easy: Chọn ngẫu nhiên từ các nước đi tiềm năng
    if (this.difficulty === "easy") {
      const availableMoves = potentialMoves.filter(i => board[i] === null);
      const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
      console.log("Random move (Easy):", randomMove);
      return randomMove;
    }

    // Normal: Chỉ sử dụng chiến lược tấn công và phòng thủ cơ bản
    if (this.difficulty === "normal") {
      const attackingMove = this.findAttackingMove(board, player, opponent);
      if (attackingMove !== null) {
        console.log("Attacking move (Normal):", attackingMove);
        return attackingMove;
      }

      const defensiveMove = this.findDefensiveMove(board, opponent, player);
      if (defensiveMove !== null) {
        console.log("Defensive move (Normal):", defensiveMove);
        return defensiveMove;
      }

      const availableMoves = potentialMoves.filter(i => board[i] === null);
      const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
      console.log("Random move (Normal):", randomMove);
      return randomMove;
    }

    // Hard: Sử dụng đầy đủ chiến lược tấn công, phòng thủ và đánh giá bảng
    if (this.difficulty === "hard") {
      const attackingMove = this.findAttackingMove(board, player, opponent);
      if (attackingMove !== null) {
        console.log("Attacking move (Hard):", attackingMove);
        return attackingMove;
      }

      const defensiveMove = this.findDefensiveMove(board, opponent, player);
      if (defensiveMove !== null) {
        console.log("Defensive move (Hard):", defensiveMove);
        return defensiveMove;
      }

      let bestScore = -Infinity;
      let bestMove = null;

      for (const move of potentialMoves) {
        if (board[move] !== null) continue;
        board[move] = player;
        const score = this.evaluateBoard(board, player, opponent);
        board[move] = null;

        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }

      console.log("Best move based on evaluation (Hard):", bestMove);
      return bestMove !== null ? bestMove : potentialMoves[0];
    }

    // Hardcore: Sử dụng chiến lược nâng cao với đánh giá sâu hơn
    if (this.difficulty === "hardcore") {
      const attackingMove = this.findAttackingMove(board, player, opponent);
      if (attackingMove !== null) {
        console.log("Attacking move (Hardcore):", attackingMove);
        return attackingMove;
      }

      const defensiveMove = this.findDefensiveMove(board, opponent, player);
      if (defensiveMove !== null) {
        console.log("Defensive move (Hardcore):", defensiveMove);
        return defensiveMove;
      }

      let bestScore = -Infinity;
      let bestMove = null;

      for (const move of potentialMoves) {
        if (board[move] !== null) continue;
        board[move] = player;
        let score = this.evaluateBoard(board, player, opponent);

        // Đánh giá thêm một bước của đối thủ (minimax cơ bản)
        const opponentMoves = this.getPotentialMoves(board);
        let worstOpponentScore = Infinity;
        for (const oppMove of opponentMoves) {
          if (board[oppMove] !== null) continue;
          board[oppMove] = opponent;
          const oppScore = this.evaluateBoard(board, player, opponent);
          board[oppMove] = null;
          worstOpponentScore = Math.min(worstOpponentScore, oppScore);
        }
        score -= worstOpponentScore * 0.5; // Giảm điểm dựa trên nước đi tốt nhất của đối thủ

        board[move] = null;

        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }

      console.log("Best move based on deep evaluation (Hardcore):", bestMove);
      return bestMove !== null ? bestMove : potentialMoves[0];
    }

    // Mặc định trả về nước đi ngẫu nhiên nếu độ khó không hợp lệ
    const availableMoves = potentialMoves.filter(i => board[i] === null);
    const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    console.log("Random move (Default):", randomMove);
    return randomMove;
  }
}

export default function PlayWithAI() {
  const navigate = useNavigate();
  const size = 15;
  const [board, setBoard] = useState(Array(size * size).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [ai, setAI] = useState(null);
  const [difficulty, setDifficulty] = useState("hard"); // Mặc định là hard
  const winner = calculateWinner(board, size);
  const winningCells = winner ? findWinningCells(board, size, winner) : [];
  const isDraw = !winner && board.every(cell => cell !== null);

  useEffect(() => {
    const aiInstance = new GomokuAI(size, difficulty);
    setAI(aiInstance);
  }, [difficulty]); // Khởi tạo lại AI khi độ khó thay đổi

  function playAIMove(currentBoard) {
    if (!ai) {
      console.log("AI not initialized yet");
      return;
    }

    const aiMove = ai.getBestMove([...currentBoard], "X", "O");
    if (aiMove !== null && aiMove !== undefined) {
      const newBoard = [...currentBoard];
      newBoard[aiMove] = "X";
      setBoard(newBoard);
      setIsPlayerTurn(true);
      console.log("AI moved to:", aiMove);
    } else {
      console.log("No valid AI move found");
      setIsPlayerTurn(true);
    }
  }

  function handleClick(index) {
    if (board[index] || winner || !isPlayerTurn) return;
    const newBoard = [...board];
    newBoard[index] = "O";
    setBoard(newBoard);
    setIsPlayerTurn(false);
    if (!calculateWinner(newBoard, size) && !isDraw) {
      setTimeout(() => playAIMove(newBoard), 300);
    }
  }

  function calculateWinner(board, size) {
    const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        for (const [dx, dy] of directions) {
          let count = 1;
          const start = r * size + c;
          if (!board[start]) continue;
          for (let step = 1; step < 5; step++) {
            const x = r + dx * step;
            const y = c + dy * step;
            if (x >= size || y >= size || y < 0 || board[x * size + y] !== board[start]) break;
            count++;
          }
          if (count === 5) return board[start];
        }
      }
    }
    return null;
  }

  function findWinningCells(board, size, winner) {
    const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
    const winningCells = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const start = r * size + c;
        if (!board[start] || board[start] !== winner) continue;

        for (const [dx, dy] of directions) {
          let count = 1;
          const cells = [start];
          for (let step = 1; step < 5; step++) {
            const x = r + dx * step;
            const y = c + dy * step;
            if (x >= size || y >= size || y < 0) break;
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

  const resetGame = () => {
    setBoard(Array(size * size).fill(null));
    setIsPlayerTurn(true);
  };

  return (
    <div
      className="flex flex-col items-center min-h-screen text-white"
      style={{
        backgroundImage:
          "url('https://png.pngtree.com/background/20230520/original/pngtree-futuristic-image-with-led-lights-and-large-cubes-picture-image_2679465.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h1 className="text-3xl font-bold mb-4">Gomoku: You (O) vs Bot (X)</h1>

      {/* Thêm giao diện chọn độ khó */}
      <div className="mb-4 flex space-x-2">
        <label htmlFor="difficulty" className="text-lg font-semibold">
          Difficulty:
        </label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="px-2 py-1 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none"
        >
          <option value="easy">Easy</option>
          <option value="normal">Normal</option>
          <option value="hard">Hard</option>
          <option value="hardcore">Hardcore</option>
        </select>
      </div>

      <div
        className="grid gap-1 p-2 bg-gray-900 bg-opacity-70 rounded-lg"
        style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
      >
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            disabled={cell || winner || !isPlayerTurn}
            className={`w-10 h-10 flex items-center justify-center rounded-lg border border-gray-600 hover:bg-gray-700 ${
              winningCells.includes(i)
                ? "bg-white text-black font-bold border-2 border-gray-300 animate-pulse"
                : cell === "X"
                ? "bg-blue-600 text-white"
                : cell === "O"
                ? "bg-red-600 text-white"
                : "bg-gray-800"
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
                <span className="text-green-400">
                  {winner === "O" ? "You Win!" : "Bot Wins!"}
                </span>
              ) : (
                <span className="text-yellow-400">It's a Draw!</span>
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
        <div className="mt-4 flex space-x-4">
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600"
          >
            Reset
          </button>
          <button
            onClick={() => navigate("/main")}
            className="px-6 py-2 bg-blue-500 rounded-lg hover:bg-blue-600"
          >
            Back
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-pulse {
          animation: pulse 0.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}