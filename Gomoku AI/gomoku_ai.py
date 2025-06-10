import numpy as np
import json
import random
import os

BOARD_SIZE = 15  # Tăng lên 15
WIN_LENGTH = 5
EMPTY, PLAYER, AI = 0, 1, 2

class Gomoku:
    def __init__(self):
        self.board = np.zeros((BOARD_SIZE, BOARD_SIZE), dtype=int)
        self.q_table = {}
        self.load_q_table()

    def reset(self):
        self.board = np.zeros((BOARD_SIZE, BOARD_SIZE), dtype=int)

    def get_state(self):
        return str(self.board.flatten().tolist())

    def is_valid_move(self, x, y):
        return 0 <= x < BOARD_SIZE and 0 <= y < BOARD_SIZE and self.board[x, y] == EMPTY

    def check_winner(self, player):
        for i in range(BOARD_SIZE):
            for j in range(BOARD_SIZE):
                if j <= BOARD_SIZE - WIN_LENGTH and all(self.board[i, j + k] == player for k in range(WIN_LENGTH)):
                    return True
                if i <= BOARD_SIZE - WIN_LENGTH and all(self.board[i + k, j] == player for k in range(WIN_LENGTH)):
                    return True
                if i <= BOARD_SIZE - WIN_LENGTH and j <= BOARD_SIZE - WIN_LENGTH and \
                   all(self.board[i + k, j + k] == player for k in range(WIN_LENGTH)):
                    return True
                if i >= WIN_LENGTH - 1 and j <= BOARD_SIZE - WIN_LENGTH and \
                   all(self.board[i - k, j + k] == player for k in range(WIN_LENGTH)):
                    return True
        return False

    def is_board_full(self):
        return not any(EMPTY in row for row in self.board)

    def make_move(self, x, y, player):
        if self.is_valid_move(x, y):
            self.board[x, y] = player
            return True
        return False

    def get_available_moves(self):
        return [(x, y) for x in range(BOARD_SIZE) for y in range(BOARD_SIZE) if self.is_valid_move(x, y)]

    def choose_action(self, epsilon=0.1):
        state = self.get_state()
        available_moves = self.get_available_moves()
        if not available_moves:
            return None
        if random.random() < epsilon or state not in self.q_table:
            return random.choice(available_moves)
        else:
            q_values = self.q_table[state]
            return max(available_moves, key=lambda move: q_values.get(str(move), 0))

    def update_q_table(self, state, action, reward, next_state):
        if state not in self.q_table:
            self.q_table[state] = {}
        if next_state not in self.q_table:
            self.q_table[next_state] = {}
        action_str = str(action)
        old_q = self.q_table[state].get(action_str, 0)
        next_max_q = max(self.q_table[next_state].values(), default=0)
        learning_rate, discount = 0.1, 0.9
        new_q = old_q + learning_rate * (reward + discount * next_max_q - old_q)
        self.q_table[state][action_str] = new_q

    def save_q_table(self):
        with open('q_table.json', 'w') as f:
            json.dump(self.q_table, f)

    def load_q_table(self):
        if os.path.exists('q_table.json'):
            with open('q_table.json', 'r') as f:
                self.q_table = json.load(f)

def train_ai(episodes=10000):
    game = Gomoku()
    for episode in range(episodes):
        game.reset()
        while True:
            state = game.get_state()
            action = game.choose_action()
            if action is None:
                break
            game.make_move(*action, AI)
            if game.check_winner(AI):
                game.update_q_table(state, action, 10, game.get_state())
                break
            elif game.is_board_full():
                game.update_q_table(state, action, 0, game.get_state())
                break

            player_move = random.choice(game.get_available_moves())
            game.make_move(*player_move, PLAYER)
            next_state = game.get_state()
            if game.check_winner(PLAYER):
                game.update_q_table(state, action, -10, next_state)
                break
            elif game.is_board_full():
                game.update_q_table(state, action, 0, next_state)
                break
            else:
                game.update_q_table(state, action, 0, next_state)

        if episode % 100 == 0:
            print(f"Episode {episode} completed")
    game.save_q_table()
    print("Training completed and Q-table saved to 'q_table.json'")

if __name__ == "__main__":
    train_ai(10000)


class GomokuAI:
    pass