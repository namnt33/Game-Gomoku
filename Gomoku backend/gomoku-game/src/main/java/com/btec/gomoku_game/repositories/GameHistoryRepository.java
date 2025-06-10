package com.btec.gomoku_game.repositories;

import com.btec.gomoku_game.entities.GameHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface GameHistoryRepository extends MongoRepository<GameHistory, String> {
    Optional<GameHistory> findById(String roomId);
}