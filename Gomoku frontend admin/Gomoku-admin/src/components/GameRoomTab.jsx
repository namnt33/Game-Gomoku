import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GameRoomTab = () => {
  const [gameRooms, setGameRooms] = useState([]);

  useEffect(() => {
    fetchGameRooms();
  }, []);

  const fetchGameRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/games/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGameRooms(response.data);
    } catch (error) {
      console.error('Error fetching game rooms:', error);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Game Rooms</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Room ID</th>
            <th className="border p-2">Player 1</th>
            <th className="border p-2">Player 2</th>
            <th className="border p-2">Current Turn</th>
            <th className="border p-2">Winner</th>
            <th className="border p-2">Finished</th>
          </tr>
        </thead>
        <tbody>
          {gameRooms.map((room) => (
            <tr key={room.roomId} className="border-b">
              <td className="border p-2">{room.roomId}</td>
              <td className="border p-2">{room.player1}</td>
              <td className="border p-2">{room.player2 || 'Waiting'}</td>
              <td className="border p-2">{room.currentTurn}</td>
              <td className="border p-2">{room.winner || 'N/A'}</td>
              <td className="border p-2">{room.finished ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GameRoomTab;