import { useState } from "react";
import { useNavigate } from "react-router-dom";

const instructions = {
  en: {
    title: "How to Play Gomoku",
    content: `
      Gomoku is a classic strategy board game played on a 15x15 grid. Two players take turns placing their symbols, "X" or "O", on the board with the goal of forming a line of five consecutive symbols—horizontally, vertically, or diagonally—before their opponent does.

      **How to Play:**
      1. The game begins with an empty 15x15 grid.
      2. Player 1 uses "X" and always goes first.
      3. Player 2 uses "O" and follows Player 1.
      4. Players alternate turns, placing one "X" or "O" in an empty square each turn.
      5. The first player to connect five "X"s or "O"s in a row (horizontally, vertically, or diagonally) wins the game.
      6. If the entire board is filled without a winner, the game ends in a draw.
      
      **Tips:**
      - Try to create multiple threats to connect five while blocking your opponent’s attempts.
      - The center of the board is a strong starting position!
    `,
  },
  vi: {
    title: "Cách chơi cờ Gomoku",
    content: `
      Cờ Gomoku là một trò chơi chiến thuật cổ điển được chơi trên bàn cờ 15x15. Hai người chơi lần lượt đặt ký hiệu của mình, "X" hoặc "O", lên bàn cờ với mục tiêu tạo thành một hàng gồm năm ký hiệu liên tiếp—theo chiều ngang, dọc hoặc chéo—trước đối thủ.

      **Cách chơi:**
      1. Trò chơi bắt đầu với bàn cờ trống 15x15.
      2. Người chơi 1 sử dụng "X" và luôn đi trước.
      3. Người chơi 2 sử dụng "O" và đi sau người chơi 1.
      4. Người chơi thay phiên nhau, mỗi lượt đặt một "X" hoặc "O" vào ô trống.
      5. Người đầu tiên xếp được năm "X" hoặc "O" liên tiếp (ngang, dọc hoặc chéo) sẽ thắng.
      6. Nếu bàn cờ đầy mà không có người thắng, trò chơi kết thúc với kết quả hòa.

      **Mẹo chơi:**
      - Tạo nhiều cơ hội xếp năm quân đồng thời chặn đường của đối thủ.
      - Vị trí trung tâm bàn cờ là điểm khởi đầu mạnh mẽ!
    `,
  },
  es: {
    title: "Cómo Jugar Gomoku",
    content: `
      Gomoku es un juego de estrategia clásico que se juega en un tablero de 15x15. Dos jugadores se turnan para colocar sus símbolos, "X" o "O", en el tablero con el objetivo de formar una línea de cinco símbolos consecutivos—horizontal, vertical o diagonalmente—antes que su oponente.

      **Cómo jugar:**
      1. El juego comienza con un tablero vacío de 15x15.
      2. El Jugador 1 usa "X" y siempre empieza.
      3. El Jugador 2 usa "O" y sigue al Jugador 1.
      4. Los jugadores alternan turnos, colocando un "X" o "O" en un espacio vacío por turno.
      5. El primer jugador en conectar cinco "X" o "O" en una fila (horizontal, vertical o diagonal) gana.
      6. Si el tablero se llena sin un ganador, el juego termina en empate.

      **Consejos:**
      - Intenta crear múltiples amenazas para conectar cinco mientras bloqueas a tu oponente.
      - ¡El centro del tablero es una posición inicial fuerte!
    `,
  },
  fr: {
    title: "Comment Jouer au Gomoku",
    content: `
      Le Gomoku est un jeu de stratégie classique joué sur une grille de 15x15. Deux joueurs placent à tour de rôle leurs symboles, "X" ou "O", sur le plateau dans le but de former une ligne de cinq symboles consécutifs—horizontalement, verticalement ou en diagonale—avant leur adversaire.

      **Comment jouer :**
      1. Le jeu commence avec une grille vide de 15x15.
      2. Le Joueur 1 utilise "X" et commence toujours.
      3. Le Joueur 2 utilise "O" et suit le Joueur 1.
      4. Les joueurs alternent les tours, en plaçant un "X" ou un "O" dans une case vide à chaque tour.
      5. Le premier joueur à aligner cinq "X" ou "O" consécutifs (horizontalement, verticalement ou en diagonale) gagne.
      6. Si la grille est entièrement remplie sans vainqueur, la partie se termine par un match nul.

      **Astuces :**
      - Créez plusieurs opportunités d’aligner cinq tout en bloquant votre adversaire.
      - Le centre du plateau est une position de départ puissante !
    `,
  },
  de: {
    title: "Wie man Gomoku spielt",
    content: `
      Gomoku ist ein klassisches Strategiespiel, das auf einem 15x15-Brett gespielt wird. Zwei Spieler setzen abwechselnd ihre Symbole, "X" oder "O", auf das Brett, mit dem Ziel, eine Reihe von fünf aufeinanderfolgenden Symbolen—horizontal, vertikal oder diagonal—vor dem Gegner zu bilden.

      **Spielanleitung:**
      1. Das Spiel beginnt mit einem leeren 15x15-Brett.
      2. Spieler 1 verwendet "X" und beginnt immer.
      3. Spieler 2 verwendet "O" und folgt Spieler 1.
      4. Die Spieler wechseln sich ab und setzen bei jedem Zug ein "X" oder "O" in ein leeres Feld.
      5. Der erste Spieler, der fünf "X" oder "O" in einer Reihe (horizontal, vertikal oder diagonal) verbindet, gewinnt.
      6. Wenn das Brett voll ist und es keinen Gewinner gibt, endet das Spiel unentschieden.

      **Tipps:**
      - Versuche, mehrere Möglichkeiten zu schaffen, fünf zu verbinden, während du den Gegner blockierst.
      - Die Mitte des Brettes ist eine starke Ausgangsposition!
    `,
  },
  jp: {
    title: "五目並べの遊び方",
    content: `
      五目並べは、15x15のボードで遊ぶ古典的な戦略ゲームです。2人のプレイヤーが交互に自分の記号、"X"または"O"をボードに配置し、水平、垂直、または斜めに5つの連続した記号を相手より先に作ることを目指します。

      **遊び方:**
      1. ゲームは15x15の空のボードから始まります。
      2. プレイヤー1は"X"を使用し、常に最初に動きます。
      3. プレイヤー2は"O"を使用し、プレイヤー1の後に続きます。
      4. プレイヤーは交互に、1ターンごとに空のマスに"X"または"O"を1つ置きます。
      5. 水平、垂直、または斜めに5つの"X"または"O"を連続して並べた最初のプレイヤーが勝ちます。
      6. ボードが全て埋まり、勝者がいない場合、ゲームは引き分けで終了します。

      **ヒント:**
      - 5つを並べる複数のチャンスを作りつつ、相手の試みをブロックしてください。
      - ボードの中心は強力なスタート位置です！
    `,
  },
  cn: {
    title: "如何玩五子棋",
    content: `
      五子棋是一种在15x15棋盘上进行的经典策略游戏。两名玩家轮流放置自己的符号，"X"或"O"，目标是在水平、垂直或对角线上先于对手连成五个连续的符号。

      **玩法:**
      1. 游戏从一个空的15x15棋盘开始。
      2. 玩家1使用"X"，总是先行动。
      3. 玩家2使用"O"，紧随玩家1之后。
      4. 玩家轮流行动，每回合在一个空格放置一个"X"或"O"。
      5. 第一个在水平、垂直或对角线上连成五个"X"或"O"的玩家获胜。
      6. 如果棋盘全部填满而没有胜者，游戏以平局结束。

      **技巧:**
      - 尝试创造多个连五的机会，同时阻止对手的尝试。
      - 棋盘中心是一个强大的起点！
    `,
  },
};

const ExplainRules = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("en");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center text-white p-6" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')` }}>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-black/50 animate-gradient-shift"></div>
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 animate-text-glow">
          {instructions[language].title}
        </h1>

        <select
          onChange={(e) => setLanguage(e.target.value)}
          value={language}
          className="mb-6 px-4 py-2 bg-gray-700/80 border border-gray-600 text-white rounded-lg shadow-lg focus:ring-4 focus:ring-blue-500/50 focus:outline-none transform hover:scale-105 hover:rotate-1 transition-all duration-500 animate-bounce-in"
        >
          <option value="en">🇬🇧 English</option>
          <option value="vi">🇻🇳 Tiếng Việt</option>
          <option value="es">🇪🇸 Español</option>
          <option value="fr">🇫🇷 Français</option>
          <option value="de">🇩🇪 Deutsch</option>
          <option value="jp">🇯🇵 日本語</option>
          <option value="cn">🇨🇳 中文</option>
        </select>

        <div className="w-full max-w-3xl bg-gray-800/80 backdrop-blur-md p-6 rounded-xl shadow-2xl border border-gray-700/50 animate-fade-slide-up">
          <p className="whitespace-pre-line text-gray-200 leading-relaxed animate-text-reveal">
            {instructions[language].content}
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 transform hover:scale-110 hover:rotate-2 transition-all duration-500 ease-in-out relative overflow-hidden group"
          >
            <span className="relative z-10">Back</span>
            <span className="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-40 animate-pulse transition-opacity duration-500"></span>
          </button>
        </div>
      </div>

      <style jsx>{`
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
          0% { transform: scale(0.3); opacity: 0; }
          60% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes fade-slide-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
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
        .animate-fade-slide-up {
          animation: fade-slide-up 0.8s ease-out;
        }
        .animate-text-reveal {
          animation: text-reveal 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ExplainRules;