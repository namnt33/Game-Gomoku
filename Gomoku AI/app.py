from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import json
import os
import random

app = Flask(__name__)
CORS(app)

BOARD_SIZE = 15
WIN_LENGTH = 5
EMPTY, PLAYER, AI = 0, 1, 2

class Gomoku:
    def __init__(self):
        self.board = np.zeros((BOARD_SIZE, BOARD_SIZE), dtype=int)
        self.q_table = {}
        self.load_q_table()

    def load_q_table(self):
        try:
            if os.path.exists('q_table.json'):
                with open('q_table.json', 'r') as f:
                    self.q_table = json.load(f)
            else:
                print("Warning: q_table.json not found. Using empty Q-table.")
        except Exception as e:
            print(f"Error loading q_table.json: {e}")
            self.q_table = {}

    def get_state(self):
        return str(self.board.flatten().tolist())

    def is_valid_move(self, x, y):
        return 0 <= x < BOARD_SIZE and 0 <= y < BOARD_SIZE and self.board[x, y] == EMPTY

    def make_move(self, x, y, player):
        if self.is_valid_move(x, y):
            self.board[x, y] = player
            return True
        return False

    def get_available_moves(self):
        return [(x, y) for x in range(BOARD_SIZE) for y in range(BOARD_SIZE) if self.is_valid_move(x, y)]

    def check_blocking_move(self):
        # Kiểm tra các dãy "O" của người chơi và chặn
        directions = [(1, 0), (0, 1), (1, 1), (1, -1)]  # Ngang, dọc, chéo
        for x in range(BOARD_SIZE):
            for y in range(BOARD_SIZE):
                for dx, dy in directions:
                    # Kiểm tra dãy 5 ô theo hướng (dx, dy)
                    for length in range(2, WIN_LENGTH):  # Kiểm tra dãy từ 2 đến 4 quân
                        count = 0
                        empty_positions = []
                        # Kiểm tra dãy có độ dài "length + 1" (để có chỗ chặn)
                        for i in range(length + 1):
                            nx, ny = x + i * dx, y + i * dy
                            if 0 <= nx < BOARD_SIZE and 0 <= ny < BOARD_SIZE:
                                if self.board[nx, ny] == PLAYER:
                                    count += 1
                                elif self.board[nx, ny] == EMPTY:
                                    empty_positions.append((nx, ny))
                                else:
                                    count = 0
                                    empty_positions = []
                                    break
                            else:
                                count = 0
                                empty_positions = []
                                break
                        # Nếu có "length" quân "O" liên tiếp và có ít nhất 1 ô trống để chặn
                        if count == length and empty_positions:
                            # Ưu tiên chặn dãy dài nhất (4 > 3 > 2)
                            print(f"AI found a line of {count} 'O's, blocking at:", empty_positions[0])
                            return empty_positions[0]  # Chọn ô trống đầu tiên để chặn
        return None

    def check_first_move(self):
        # Đếm số quân "O" trên bàn cờ
        player_count = np.sum(self.board == PLAYER)
        # Nếu chỉ có 1 quân "O" (nước đi đầu tiên)
        if player_count == 1:
            # Tìm vị trí của quân "O"
            for x in range(BOARD_SIZE):
                for y in range(BOARD_SIZE):
                    if self.board[x, y] == PLAYER:
                        # Tìm một ô trống liền kề để "chặn"
                        directions = [(0, 1), (1, 0), (0, -1), (-1, 0), (1, 1), (-1, -1), (1, -1), (-1, 1)]  # 8 hướng xung quanh
                        for dx, dy in directions:
                            nx, ny = x + dx, y + dy
                            if self.is_valid_move(nx, ny):
                                return (nx, ny)
        return None

    def choose_action(self):
        # Ưu tiên chặn nước đi đầu tiên
        first_move = self.check_first_move()
        if first_move:
            print("AI is responding to first move at:", first_move)
            return first_move

        # Ưu tiên chặn các dãy "O" của người chơi (từ 2 đến 4 quân)
        blocking_move = self.check_blocking_move()
        if blocking_move:
            return blocking_move

        # Nếu không cần chặn, sử dụng Q-learning
        state = self.get_state()
        available_moves = self.get_available_moves()
        if not available_moves:
            return None
        if state in self.q_table:
            q_values = self.q_table[state]
            return max(available_moves, key=lambda move: q_values.get(str(move), 0))
        return random.choice(available_moves)

game = Gomoku()

@app.route('/ai-move', methods=['POST'])
def ai_move():
    try:
        data = request.json
        print("Received data:", data)
        if not data or 'board' not in data:
            return jsonify({'error': 'Invalid request: board data missing'}), 400

        board = data['board']
        print("Board length:", len(board))
        if len(board) != BOARD_SIZE * BOARD_SIZE:
            return jsonify({'error': f'Invalid board size: expected {BOARD_SIZE * BOARD_SIZE}, got {len(board)}'}), 400

        game.board = np.array([0 if cell is None else (1 if cell == "O" else 2) for cell in board]).reshape(BOARD_SIZE, BOARD_SIZE)
        move = game.choose_action()
        if move is None:
            return jsonify({'error': 'No available moves'}), 400

        ai_x, ai_y = move
        game.make_move(ai_x, ai_y, AI)
        ai_index = ai_x * BOARD_SIZE + ai_y
        return jsonify({'ai_move': ai_index})
    except Exception as e:
        print(f"Error in ai_move: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)