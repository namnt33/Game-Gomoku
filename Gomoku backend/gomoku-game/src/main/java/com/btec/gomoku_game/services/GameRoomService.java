package com.btec.gomoku_game.services;

import com.btec.gomoku_game.entities.GameHistory;
import com.btec.gomoku_game.entities.GameRoom;
import com.btec.gomoku_game.repositories.GameHistoryRepository;
import com.btec.gomoku_game.repositories.GameRoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate; // Thêm import
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GameRoomService {
    @Autowired
    private GameRoomRepository gameRoomRepository;
    @Autowired
    private GameHistoryRepository gameHistoryRepository;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public GameRoom createRoom(String roomId, String player1) {
        if (gameRoomRepository.findByRoomId(roomId).isPresent()) {
            throw new IllegalArgumentException("Room ID already exists");
        }
        GameRoom gameRoom = new GameRoom(roomId, player1);
        gameRoom.setCurrentTurn("X");
        GameHistory history = new GameHistory(roomId, player1, null);
        gameHistoryRepository.save(history);
        gameRoom = gameRoomRepository.save(gameRoom);
        messagingTemplate.convertAndSend("/topic/game/" + roomId, gameRoom); // Thông báo phòng được tạo
        return gameRoom;
    }

    public void saveGameRoom(GameRoom gameRoom) {
        gameRoomRepository.save(gameRoom);
    }

    public void deleteGameRoom(String roomId) {
        gameRoomRepository.deleteByRoomId(roomId);
        gameHistoryRepository.deleteById(roomId);
    }

    

    public GameRoom makeMove(String roomId, int row, int col, String playerSymbol) {
        Optional<GameRoom> roomOptional = getGameById(roomId);
        if (!roomOptional.isPresent()) {
            throw new IllegalArgumentException("Room not found");
        }

        GameRoom room = roomOptional.get();
        if (room.isFinished()) {
            throw new IllegalArgumentException("Game is already finished");
        }
        if (room.getPlayer2() == null) {
            throw new IllegalArgumentException("Waiting for second player");
        }

        String player = playerSymbol.equals("X") ? room.getPlayer1() : room.getPlayer2();
        if (player == null) {
            throw new IllegalArgumentException("Invalid player symbol or player not in room");
        }

        String[][] board = room.getBoard();
        if (!board[row][col].isEmpty()) {
            throw new IllegalArgumentException("Position already taken");
        }
        if (!room.getCurrentTurn().equals(playerSymbol)) {
            throw new IllegalArgumentException("Not your turn");
        }

        board[row][col] = room.getCurrentTurn();
        if (checkWin(board, row, col, room.getCurrentTurn())) {
            room.setFinished(true);
            room.setWinner(player);
            Optional<GameHistory> historyOpt = gameHistoryRepository.findById(roomId);
            if (historyOpt.isPresent()) {
                GameHistory history = historyOpt.get();
                history.setWinner(player);
                history.setEndTime(System.currentTimeMillis());
                gameHistoryRepository.save(history);
            }
        } else {
            int filledCells = 0;
            for (String[] rowBoard : board) {
                for (String cell : rowBoard) {
                    if (!cell.isEmpty()) filledCells++;
                }
            }
            if (filledCells == 15 * 15) {
                room.setFinished(true);
                room.setWinner(null); // Hòa
            } else {
                room.setCurrentTurn(room.getCurrentTurn().equals("X") ? "O" : "X");
            }
        }
        gameRoomRepository.save(room);
        messagingTemplate.convertAndSend("/topic/game/" + roomId, room);
        return room;
    }


    private boolean checkWin(String[][] board, int row, int col, String symbol) {
        int[][] directions = {{0, 1}, {1, 0}, {1, 1}, {1, -1}};
        for (int[] dir : directions) {
            int count = 1;
            for (int i = 1; i <= 4; i++) {
                int r = row + i * dir[0];
                int c = col + i * dir[1];
                if (r >= 0 && r < 15 && c >= 0 && c < 15 && board[r][c].equals(symbol)) {
                    count++;
                } else {
                    break;
                }
            }
            for (int i = 1; i <= 4; i++) {
                int r = row - i * dir[0];
                int c = col - i * dir[1];
                if (r >= 0 && r < 15 && c >= 0 && c < 15 && board[r][c].equals(symbol)) {
                    count++;
                } else {
                    break;
                }
            }
            if (count >= 5) return true;
        }
        return false;
    }

    public List<GameRoom> getAllAvailableRooms() {
        return gameRoomRepository.findAll();
    }

    public Optional<GameRoom> getGameById(String roomId) {
        return gameRoomRepository.findByRoomId(roomId);
    }

    public GameRoom joinRoom(String roomId, String player2) {
        Optional<GameRoom> roomOptional = gameRoomRepository.findByRoomId(roomId);
        if (roomOptional.isPresent()) {
            GameRoom gameRoom = roomOptional.get();
            if (gameRoom.getPlayer2() != null) {
                throw new IllegalArgumentException("Room is full");
            }
            if (gameRoom.getPlayer1().equals(player2)) {
                throw new IllegalArgumentException("Cannot join as the same player");
            }
            gameRoom.setPlayer2(player2);
            Optional<GameHistory> historyOpt = gameHistoryRepository.findById(roomId);
            if (historyOpt.isPresent()) {
                GameHistory history = historyOpt.get();
                history.setPlayer2(player2);
                gameHistoryRepository.save(history);
            }
            gameRoom = gameRoomRepository.save(gameRoom);
            messagingTemplate.convertAndSend("/topic/game/" + roomId, gameRoom); // Thông báo player2 tham gia
            return gameRoom;
        }
        throw new RuntimeException("Room not found");
    }

    // Thêm phương thức xử lý Rematch
    public GameRoom requestRematch(String roomId, String playerEmail) {
        Optional<GameRoom> roomOptional = getGameById(roomId);
        if (!roomOptional.isPresent()) {
            throw new IllegalArgumentException("Room not found");
        }
        GameRoom gameRoom = roomOptional.get();
        if (!gameRoom.isFinished()) {
            throw new IllegalStateException("Game is not finished yet");
        }

        if (playerEmail.equals(gameRoom.getPlayer1())) {
            gameRoom.setPlayer1WantsRematch(true);
        } else if (playerEmail.equals(gameRoom.getPlayer2())) {
            gameRoom.setPlayer2WantsRematch(true);
        } else {
            throw new IllegalArgumentException("Player not in this room");
        }

        gameRoomRepository.save(gameRoom);
        messagingTemplate.convertAndSend("/topic/game/" + roomId, gameRoom);
        return gameRoom;
    }

    public GameRoom respondToRematch(String roomId, String playerEmail, boolean accepted) {
        Optional<GameRoom> roomOptional = getGameById(roomId);
        if (!roomOptional.isPresent()) {
            throw new IllegalArgumentException("Room not found");
        }
        GameRoom gameRoom = roomOptional.get();
        if (!gameRoom.isFinished()) {
            throw new IllegalStateException("Game is not finished yet");
        }

        if (!playerEmail.equals(gameRoom.getPlayer1()) && !playerEmail.equals(gameRoom.getPlayer2())) {
            throw new IllegalArgumentException("Player not in this room");
        }

        if (accepted) {
            if (playerEmail.equals(gameRoom.getPlayer1())) {
                gameRoom.setPlayer1WantsRematch(true);
            } else {
                gameRoom.setPlayer2WantsRematch(true);
            }

            if (gameRoom.isPlayer1WantsRematch() && gameRoom.isPlayer2WantsRematch()) {
                gameRoom.resetBoard();
            }
        } else {
            gameRoom.setRematchDeclined(true); // Đánh dấu rematch bị từ chối
        }

        gameRoomRepository.save(gameRoom);
        messagingTemplate.convertAndSend("/topic/game/" + roomId, gameRoom);
        return gameRoom;
    }


}