package com.btec.gomoku_game.entities;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Arrays;

@Document(collection = "game_rooms")
public class GameRoom {
    @Id
    private String id;
    private String roomId;
    private String player1;
    private String player2;
    private String[][] board;
    private String currentTurn;
    private String winner;
    private boolean finished;
    // Thêm các trường để theo dõi trạng thái Rematch
    private boolean player1WantsRematch;
    private boolean player2WantsRematch;
    private boolean rematchDeclined;

    public GameRoom() {
        this.board = new String[15][15];
        for (int i = 0; i < 15; i++) {
            for (int j = 0; j < 15; j++) {
                this.board[i][j] = "";
            }
        }
    }

    public GameRoom(String roomId, String player1) {
        this();
        this.roomId = roomId;
        this.player1 = player1;
        this.currentTurn = "X";
        this.finished = false;
        this.player1WantsRematch = false;
        this.player2WantsRematch = false;
        this.rematchDeclined = false;
    }

    // Getters và setters
//    public String getId() { return id; }
//    public void setId(String id) { this.id = id; }
    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }
    public String getPlayer1() { return player1; }
    public void setPlayer1(String player1) { this.player1 = player1; }
    public String getPlayer2() { return player2; }
    public void setPlayer2(String player2) { this.player2 = player2; }
    public String[][] getBoard() { return board; }
    public void setBoard(String[][] board) { this.board = board; }
    public String getCurrentTurn() { return currentTurn; }
    public void setCurrentTurn(String currentTurn) { this.currentTurn = currentTurn; }
    public String getWinner() { return winner; }
    public void setWinner(String winner) { this.winner = winner; }
    public boolean isPlayer1WantsRematch() {
        return player1WantsRematch;
    }

    public void setPlayer1WantsRematch(boolean player1WantsRematch) {
        this.player1WantsRematch = player1WantsRematch;
    }

    public boolean isPlayer2WantsRematch() {
        return player2WantsRematch;
    }

    public void setPlayer2WantsRematch(boolean player2WantsRematch) {
        this.player2WantsRematch = player2WantsRematch;
    }
    public boolean isFinished() { return finished; }
    public void setFinished(boolean finished) { this.finished = finished; }
    public boolean isRematchDeclined() { return rematchDeclined; } // Getter cho rematchDeclined
    public void setRematchDeclined(boolean rematchDeclined) { this.rematchDeclined = rematchDeclined; }

    public void resetBoard() {
        this.board = new String[15][15];
        for (String[] row : board) {
            Arrays.fill(row, "");
        }
        this.currentTurn = "X";
        this.winner = null;
        this.finished = false;
        this.player1WantsRematch = false;
        this.player2WantsRematch = false;
        this.rematchDeclined = false;
    }
}