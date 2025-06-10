package com.btec.gomoku_game.controllers;

import com.btec.gomoku_game.entities.GameRoom;
import com.btec.gomoku_game.security.JwtUtil;
import com.btec.gomoku_game.services.GameRoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
@CrossOrigin
@RestController
@RequestMapping("/api/games")
public class GameRoomController {
    @Autowired
    private GameRoomService gameRoomService;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private String authenticate(String authHeader) throws Exception {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new Exception("No valid Authorization header");
        }
        String token = authHeader.substring(7);
        if (JwtUtil.verifyToken(token)) {
            return JwtUtil.getEmailFromToken(token);
        }
        throw new Exception("Invalid token");
    }

    @PostMapping("/create")
    public ResponseEntity<?> createRoom(@RequestHeader("Authorization") String authHeader,
                                        @RequestBody Map<String, String> request) {
        try {
            String player1 = authenticate(authHeader);
            String roomId = request.get("roomId");

            if (roomId == null) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("message", "Room ID is required"));
            }

            GameRoom gameRoom = gameRoomService.createRoom(roomId, player1);
            return ResponseEntity.ok(gameRoom);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("message", "Unauthorized: " + e.getMessage()));
        }
    }

    @PostMapping("/join")
    public ResponseEntity<?> joinRoom(@RequestHeader("Authorization") String authHeader,
                                      @RequestBody Map<String, String> request) {
        try {
            String player2 = authenticate(authHeader);
            String roomId = request.get("roomId");

            if (roomId == null) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("message", "Room ID is required"));
            }

            Optional<GameRoom> roomOptional = gameRoomService.getGameById(roomId);
            if (!roomOptional.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("message", "Room not found"));
            }

            GameRoom gameRoom = roomOptional.get();
            if (gameRoom.getPlayer2() != null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Collections.singletonMap("message", "Room is full"));
            }

            gameRoom = gameRoomService.joinRoom(roomId, player2);
            messagingTemplate.convertAndSend("/topic/game/" + roomId, gameRoom);
            return ResponseEntity.ok(gameRoom);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("message", "Unauthorized: " + e.getMessage()));
        }
    }

    @GetMapping("/list")
    public ResponseEntity<?> getAvailableRooms(@RequestHeader("Authorization") String authHeader) {
        try {
            authenticate(authHeader);
            // Sửa logic để lấy tất cả các phòng từ GameRoomService
            List<GameRoom> availableRooms = gameRoomService.getAllAvailableRooms()
                    .stream()
                    .filter(room -> room.getPlayer2() == null && !room.isFinished())
                    .collect(Collectors.toList());
            return ResponseEntity.ok(availableRooms);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("message", "Unauthorized: " + e.getMessage()));
        }
    }
    // Thêm endpoint để lấy trạng thái phòng theo roomId
    @GetMapping("/get/{roomId}")
    public ResponseEntity<?> getRoomState(@PathVariable String roomId, @RequestHeader("Authorization") String authHeader) {
        try {
            String email = authenticate(authHeader);
            Optional<GameRoom> roomOptional = gameRoomService.getGameById(roomId);
            if (!roomOptional.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("message", "Room not found"));
            }

            GameRoom gameRoom = roomOptional.get();
            if (!email.equals(gameRoom.getPlayer1()) && !email.equals(gameRoom.getPlayer2())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Collections.singletonMap("message", "You are not a player in this room"));
            }

            return ResponseEntity.ok(gameRoom);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("message", "Unauthorized: " + e.getMessage()));
        }
    }

}