package com.btec.gomoku_game.repositories;

import com.btec.gomoku_game.entities.GameRoom;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface GameRoomRepository extends MongoRepository<GameRoom, String> {
    Optional<GameRoom> findByRoomId(String roomId);
    void deleteByRoomId(String roomId);
}