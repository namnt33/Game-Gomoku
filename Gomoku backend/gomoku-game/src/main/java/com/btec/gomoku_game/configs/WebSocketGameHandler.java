package com.btec.gomoku_game.configs;

import com.btec.gomoku_game.entities.*;
import com.btec.gomoku_game.services.GameRoomService;
import com.btec.gomoku_game.repositories.ChatMessageRepository;
import com.google.gson.Gson;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.io.BufferedReader;
import java.io.FileWriter;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Controller
public class WebSocketGameHandler {
    private static final Logger logger = LoggerFactory.getLogger(WebSocketGameHandler.class);

    @Autowired
    private GameRoomService gameRoomService;
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;


    private Map<String, String> sessionToRoomMap = new HashMap<>();

    public static class ErrorMessage {
        private String message;
        public ErrorMessage(String message) { this.message = message; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }


    //    @MessageMapping("/game/move")
    //    public void processMove(GameMove move) throws Exception {
    //        logger.info("Received move: {} at ({}, {}) in room {}", move.getPlayer(), move.getRow(), move.getCol(), move.getRoomId());
    //        if (move.getRoomId() == null || move.getPlayer() == null) {
    //            logger.warn("Invalid move: roomId or player is null");
    //            messagingTemplate.convertAndSend("/topic/game/" + move.getRoomId(), new ErrorMessage("Error: Invalid move - roomId or player is null"));
    //            return;
    //        }
    //        try {
    //            GameRoom updatedRoom = gameRoomService.makeMove(move.getRoomId(), move.getRow(), move.getCol(), move.getPlayer());
    //            logger.info("Sending updated game state to /topic/game/{}: {}", move.getRoomId(), updatedRoom);
    //            messagingTemplate.convertAndSend("/topic/game/" + move.getRoomId(), updatedRoom);
    //        } catch (IllegalArgumentException e) {
    //            logger.warn("Move failed: {}", e.getMessage());
    //            messagingTemplate.convertAndSend("/topic/game/" + move.getRoomId(), new ErrorMessage("Error: " + e.getMessage()));
    //        } catch (Exception e) {
    //            logger.error("Unexpected error during move: {}", e.getMessage());
    //            messagingTemplate.convertAndSend("/topic/game/" + move.getRoomId(), new ErrorMessage("Error: Unexpected error - " + e.getMessage()));
    //        }
    //    }

    public static class GameStateRequest {
        private String roomId;

        public String getRoomId() { return roomId; }
        public void setRoomId(String roomId) { this.roomId = roomId; }
    }

    public static class LeaveRequest {
        private String roomId;
        private String playerEmail;

        public String getRoomId() { return roomId; }
        public void setRoomId(String roomId) { this.roomId = roomId; }
        public String getPlayerEmail() { return playerEmail; }
        public void setPlayerEmail(String playerEmail) { this.playerEmail = playerEmail; }

        @Override
        public String toString() {
            return "LeaveRequest{roomId='" + roomId + "', playerEmail='" + playerEmail + "'}";
        }
    }

    @MessageMapping("/game/state")
    public void sendGameState(GameMove move) {
        logger.info("Received state request for room: {}", move.getRoomId());
        if (move.getRoomId() == null) {
            logger.warn("RoomId is null in GameMove");
            messagingTemplate.convertAndSend("/topic/game/" + move.getRoomId(), new ErrorMessage("Error: RoomId is null"));
            return;
        }
        Optional<GameRoom> gameRoom = gameRoomService.getGameById(move.getRoomId());
        if (gameRoom.isPresent()) {
            logger.info("Sending game state to /topic/game/{}: {}", move.getRoomId(), gameRoom.get());
            messagingTemplate.convertAndSend("/topic/game/" + move.getRoomId(), gameRoom.get());
        } else {
            logger.warn("Room not found: {}", move.getRoomId());
            messagingTemplate.convertAndSend("/topic/game/" + move.getRoomId(), new ErrorMessage("Error: Room not found"));
        }
    }

    @MessageMapping("/game/chat")
    public void processChat(ChatMessage message) {
        logger.info("Received chat: {}: {} in room {}", message.getSender(), message.getContent(), message.getRoomId());
        chatMessageRepository.save(message); // Lưu vào MongoDB
        // Sửa destination để khớp với subscription của frontend
        messagingTemplate.convertAndSend("/topic/game/" + message.getRoomId() + "/chat", message);
    }


    @MessageMapping("/game/rematch/request")
    public void handleRematchRequest(@Payload RematchRequest rematchRequest) {
        logger.info("Received rematch request from {} in room {}", rematchRequest.getPlayerEmail(), rematchRequest.getRoomId());
        GameRoom gameRoom = gameRoomService.requestRematch(rematchRequest.getRoomId(), rematchRequest.getPlayerEmail());
        messagingTemplate.convertAndSend("/topic/game/" + rematchRequest.getRoomId(), gameRoom);
    }

    @MessageMapping("/game/rematch/respond")
    public void handleRematchResponse(@Payload RematchResponse rematchResponse) {
        logger.info("Received rematch response from {} in room {}: {}", rematchResponse.getPlayerEmail(), rematchResponse.getRoomId(), rematchResponse.isAccepted());
        GameRoom gameRoom = gameRoomService.respondToRematch(rematchResponse.getRoomId(), rematchResponse.getPlayerEmail(), rematchResponse.isAccepted());
        messagingTemplate.convertAndSend("/topic/game/" + rematchResponse.getRoomId(), gameRoom);
    }



    @EventListener
    public void handleConnect(SessionConnectEvent event) {
        Map<String, Object> attributes = event.getMessage().getHeaders().get("simpSessionAttributes", Map.class);
        if (attributes != null) {
            String sessionId = (String) attributes.get("sessionId");
            String roomId = (String) attributes.get("roomId");
            if (sessionId != null && roomId != null) {
                sessionToRoomMap.put(sessionId, roomId);
                logger.info("Registered session {} for room {} on connect", sessionId, roomId);
            }
        }
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        String roomId = sessionToRoomMap.remove(sessionId);
        if (roomId != null) {
            logger.info("Player disconnected from room: {}", roomId);
            messagingTemplate.convertAndSend("/topic/game/" + roomId, new ErrorMessage("Opponent disconnected"));
        }
    }

    @MessageMapping("/game/move")
    public void handleGameMove(@Payload GameMove move) {
        logger.info("Received move: {}", move);
        if (move == null || move.getRoomId() == null || move.getPlayerSymbol() == null) {
            logger.warn("Invalid move: roomId or player is null");
            messagingTemplate.convertAndSend("/topic/game/" + (move != null ? move.getRoomId() : "error"), new ErrorMessage("Invalid move - roomId or player is null"));
            return;
        }
        String roomId = move.getRoomId();
        Optional<GameRoom> gameRoomOptional = gameRoomService.getGameById(roomId);
        if (gameRoomOptional.isPresent()) {
            GameRoom gameRoom = gameRoomOptional.get();
            // Kiểm tra lượt đi
            if (!gameRoom.getCurrentTurn().equals(move.getPlayerSymbol())) {
                logger.warn("Not your turn: currentTurn={}, playerSymbol={}", gameRoom.getCurrentTurn(), move.getPlayerSymbol());
                messagingTemplate.convertAndSend("/topic/game/" + roomId, new ErrorMessage("Not your turn"));
                return;
            }
            // Kiểm tra vị trí hợp lệ
            if (gameRoom.getBoard()[move.getRow()][move.getCol()].length() > 0) {
                logger.warn("Position already taken: [{},{}]", move.getRow(), move.getCol());
                messagingTemplate.convertAndSend("/topic/game/" + roomId, new ErrorMessage("Position already taken"));
                return;
            }
            // Cập nhật bàn cờ
            gameRoom.getBoard()[move.getRow()][move.getCol()] = move.getPlayerSymbol();
            // Đổi lượt
            gameRoom.setCurrentTurn(gameRoom.getCurrentTurn().equals("X") ? "O" : "X");
            // Kiểm tra thắng/thua
            if (checkWin(gameRoom, move.getRow(), move.getCol(), move.getPlayerSymbol())) {
                gameRoom.setWinner(move.getPlayerSymbol());
                gameRoom.setFinished(true);
            } else if (checkDraw(gameRoom)) {
                gameRoom.setFinished(true);
            }
            // Lưu trạng thái phòng
            gameRoomService.saveGameRoom(gameRoom);
            // Gửi trạng thái phòng cập nhật
            logger.info("Sending updated game state to /topic/game/{}: {}", roomId, gameRoom);
            messagingTemplate.convertAndSend("/topic/game/" + roomId, gameRoom);
        } else {
            logger.warn("Room not found: {}", roomId);
            messagingTemplate.convertAndSend("/topic/game/" + roomId, new ErrorMessage("Room not found"));
        }
    }

    private boolean checkWin(GameRoom gameRoom, int row, int col, String symbol) {
        String[][] board = gameRoom.getBoard();
        int count;

        // Kiểm tra hàng ngang
        count = 0;
        for (int c = 0; c < 15; c++) {
            if (board[row][c].equals(symbol)) {
                count++;
                if (count == 5) return true;
            } else {
                count = 0;
            }
        }

        // Kiểm tra cột dọc
        count = 0;
        for (int r = 0; r < 15; r++) {
            if (board[r][col].equals(symbol)) {
                count++;
                if (count == 5) return true;
            } else {
                count = 0;
            }
        }

        // Kiểm tra đường chéo chính (từ trái trên xuống phải dưới)
        count = 0;
        int r = row - Math.min(row, col);
        int c = col - Math.min(row, col);
        while (r < 15 && c < 15) {
            if (board[r][c].equals(symbol)) {
                count++;
                if (count == 5) return true;
            } else {
                count = 0;
            }
            r++;
            c++;
        }

        // Kiểm tra đường chéo phụ (từ phải trên xuống trái dưới)
        count = 0;
        r = row - Math.min(row, 14 - col);
        c = col + Math.min(row, 14 - col);
        while (r < 15 && c >= 0) {
            if (board[r][c].equals(symbol)) {
                count++;
                if (count == 5) return true;
            } else {
                count = 0;
            }
            r++;
            c--;
        }

        return false;
    }

    @MessageMapping("/game/leave")
    public void handleLeaveRoom(@Payload LeaveRequest request) {
        logger.info("Received leave request: {}", request);
        if (request == null || request.getRoomId() == null || request.getPlayerEmail() == null) {
            logger.warn("Invalid leave request: roomId or playerEmail is null");
            messagingTemplate.convertAndSend("/topic/game/" + (request != null ? request.getRoomId() : "error"), new ErrorMessage("Invalid leave request"));
            return;
        }
        String roomId = request.getRoomId();
        Optional<GameRoom> gameRoomOptional = gameRoomService.getGameById(roomId);
        if (gameRoomOptional.isPresent()) {
            GameRoom gameRoom = gameRoomOptional.get();
            if (gameRoom.isFinished()) {
                gameRoomService.deleteGameRoom(roomId);
                logger.info("Room {} deleted as game is finished and player {} left", roomId, request.getPlayerEmail());
                messagingTemplate.convertAndSend("/topic/game/" + roomId, new ErrorMessage("Game finished - room deleted"));
                return;
            }
            boolean isPlayer1 = request.getPlayerEmail().equals(gameRoom.getPlayer1());
            if (isPlayer1) {
                // Nếu player1 rời, xóa phòng ngay lập tức
                gameRoomService.deleteGameRoom(roomId);
                logger.info("Room {} deleted as creator (player1) {} left", roomId, request.getPlayerEmail());
                messagingTemplate.convertAndSend("/topic/game/" + roomId, new ErrorMessage("Room closed by creator"));
            } else if (request.getPlayerEmail().equals(gameRoom.getPlayer2())) {
                gameRoom.setPlayer2(null);
                if (gameRoom.getPlayer1() == null) {
                    gameRoomService.deleteGameRoom(roomId);
                    logger.info("Room {} deleted as both players left", roomId);
                    messagingTemplate.convertAndSend("/topic/game/" + roomId, new ErrorMessage("Room deleted as both players left"));
                } else {
                    gameRoomService.saveGameRoom(gameRoom);
                    logger.info("Updated room state after player2 {} left: {}", request.getPlayerEmail(), gameRoom);
                    messagingTemplate.convertAndSend("/topic/game/" + roomId, gameRoom);
                }
            } else {
                logger.warn("Player {} not in room {}", request.getPlayerEmail(), roomId);
                messagingTemplate.convertAndSend("/topic/game/" + roomId, new ErrorMessage("Player not in room"));
            }
        } else {
            logger.warn("Room not found: {}", roomId);
            messagingTemplate.convertAndSend("/topic/game/" + roomId, new ErrorMessage("Room not found"));
        }
    }

    private boolean checkDraw(GameRoom gameRoom) {
        String[][] board = gameRoom.getBoard();
        for (int r = 0; r < 15; r++) {
            for (int c = 0; c < 15; c++) {
                if (board[r][c].isEmpty()) {
                    return false; // Còn ô trống, chưa hòa
                }
            }
        }
        return true; // Bàn cờ đầy, hòa
    }
}