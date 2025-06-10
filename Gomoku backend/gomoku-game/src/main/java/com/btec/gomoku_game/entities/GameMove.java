package com.btec.gomoku_game.entities;

import com.fasterxml.jackson.annotation.JsonProperty;

public class GameMove {
    @JsonProperty("roomId")
    private String roomId;

    @JsonProperty("row")
    private int row;

    @JsonProperty("col")
    private int col;

    @JsonProperty("playerSymbol")
    private String playerSymbol;

    // Constructor mặc định (cần thiết cho Jackson)
    public GameMove() {}

    public GameMove(String roomId, int row, int col, String playerSymbol) {
        this.roomId = roomId;
        this.row = row;
        this.col = col;
        this.playerSymbol = playerSymbol;
    }

    // Getters và setters
    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public int getRow() {
        return row;
    }

    public void setRow(int row) {
        this.row = row;
    }

    public int getCol() {
        return col;
    }

    public void setCol(int col) {
        this.col = col;
    }

    public String getPlayerSymbol() {
        return playerSymbol;
    }

    public void setPlayerSymbol(String playerSymbol) {
        this.playerSymbol = playerSymbol;
    }

    @Override
    public String toString() {
        return "GameMove{roomId='" + roomId + "', row=" + row + ", col=" + col + ", playerSymbol='" + playerSymbol + "'}";
    }
}