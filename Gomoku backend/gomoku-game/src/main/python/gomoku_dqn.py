import numpy as np
import tensorflow as tf
from collections import deque
import random

BOARD_SIZE = 15
STATE_SIZE = BOARD_SIZE * BOARD_SIZE
ACTION_SIZE = BOARD_SIZE * BOARD_SIZE

class DQNAgent:
    def __init__(self):
        self.model = self.build_model()
        self.memory = deque(maxlen=2000)  # Bộ nhớ để replay
        self.gamma = 0.95  # Hệ số giảm giá
        self.epsilon = 1.0  # Khám phá ban đầu
        self.epsilon_min = 0.01
        self.epsilon_decay = 0.995
        self.batch_size = 32

    def build_model(self):
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(128, input_dim=STATE_SIZE, activation='relu'),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dense(ACTION_SIZE, activation='linear')
        ])
        model.compile(loss='mse', optimizer=tf.keras.optimizers.Adam(learning_rate=0.001))
        return model

    def state_to_vector(self, board):
        # Chuyển bàn cờ 15x15 thành vector 225 phần tử: 0 (trống), 1 (X), -1 (O)
        vector = np.zeros(STATE_SIZE)
        for i in range(BOARD_SIZE):
            for j in range(BOARD_SIZE):
                if board[i][j] == "X":
                    vector[i * BOARD_SIZE + j] = 1
                elif board[i][j] == "O":
                    vector[i * BOARD_SIZE + j] = -1
        return vector

    def act(self, board):
        state = self.state_to_vector(board)
        if np.random.rand() <= self.epsilon:
            # Chọn ngẫu nhiên nước đi hợp lệ
            empty_cells = [(i, j) for i in range(BOARD_SIZE) for j in range(BOARD_SIZE) if board[i][j] == ""]
            return random.choice(empty_cells) if empty_cells else (0, 0)
        # Chọn nước đi tốt nhất từ model
        q_values = self.model.predict(state.reshape(1, -1))[0]
        for i in range(ACTION_SIZE):
            row, col = divmod(i, BOARD_SIZE)
            if board[row][col] == "":
                return (row, col)
        return (0, 0)  # Default nếu không tìm được

    def remember(self, state, action, reward, next_state, done):
        self.memory.append((state, action, reward, next_state, done))

    def replay(self):
        if len(self.memory) < self.batch_size:
            return
        batch = random.sample(self.memory, self.batch_size)
        states = np.array([item[0] for item in batch])
        next_states = np.array([item[3] for item in batch])
        targets = self.model.predict(states)
        next_q_values = self.model.predict(next_states)

        for i, (state, action, reward, next_state, done) in enumerate(batch):
            target = reward if done else reward + self.gamma * np.max(next_q_values[i])
            action_idx = action[0] * BOARD_SIZE + action[1]
            targets[i][action_idx] = target

        self.model.fit(states, targets, epochs=1, verbose=0)
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay

def check_win(board, row, col, symbol):
    directions = [(0, 1), (1, 0), (1, 1), (1, -1)]
for dr, dc in directions:
    count = 1
    for i in range(1, 5):
        r, c = row + i * dr, col + i * dc
        if 0 <= r < BOARD_SIZE and 0 <= c < BOARD_SIZE and board[r][c] == symbol:
            count += 1
        else:
            break
    for i in range(1, 5):
        r, c = row - i * dr, col - i * dc
        if 0 <= r < BOARD_SIZE and 0 <= c < BOARD_SIZE and board[r][c] == symbol:
            count += 1
        else:
            break
    if count >= 5:
        return True
return False

def train_agent(episodes=1000):
    agent = DQNAgent()
for e in range(episodes):
    board = [["" for _ in range(BOARD_SIZE)] for _ in range(BOARD_SIZE)]
    done = False
    while not done:
        # AI chơi với chính nó hoặc một đối thủ ngẫu nhiên
        state = agent.state_to_vector(board)
        row, col = agent.act(board)
        board[row][col] = "O"  # AI là "O"
        reward = 0
        if check_win(board, row, col, "O"):
            reward = 1
            done = True
        elif all(board[i][j] != "" for i in range(BOARD_SIZE) for j in range(BOARD_SIZE)):
            done = True  # Hòa

        next_state = agent.state_to_vector(board)
        agent.remember(state, (row, col), reward, next_state, done)
        agent.replay()

        if not done:
            # Đối thủ ngẫu nhiên chơi "X"
            empty = [(i, j) for i in range(BOARD_SIZE) for j in range(BOARD_SIZE) if board[i][j] == ""]
            if empty:
                r, c = random.choice(empty)
                board[r][c] = "X"
                if check_win(board, r, c, "X"):
                    reward = -1
                    done = True
                agent.remember(next_state, (r, c), -reward, agent.state_to_vector(board), done)
                agent.replay()

    print(f"Episode {e+1}/{episodes} completed")
agent.model.save("gomoku_dqn.h5")
return agent

if __name__ == "__main__":
    train_agent()