const Stomp = require('@stomp/stompjs');

const client = new Stomp.Client({
    brokerURL: 'ws://localhost:8080/ws/game?roomId=room134&token=Bearer%20eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJwbGF5ZXI2QGV4YW1wbGUuY29tIiwiaWF0IjoxNzQzMjUwODk2LCJleHAiOjE3NDMzMzcyOTZ9.-_60OsuZvj2vV6nmoQPje7Q6TFvR66nNltycA2mabD0',
    debug: (str) => console.log(str),
    onConnect: () => {
        console.log('Connected to WebSocket (Player 2)!');
        client.subscribe('/topic/game/room134', (msg) => {
            console.log('Received:', msg.body);
            const data = JSON.parse(msg.body);
            if (data.message) {
                console.error('Error:', data.message);
            } else {
                console.log('Current turn:', data.currentTurn);
                console.log('Board at [1,2]:', data.board[1][2]);
                if (data.finished) {
                    console.log('Game finished! Winner:', data.winner);
                }
            }
        });
        client.publish({
            destination: '/app/game/state',
            body: JSON.stringify({ roomId: 'room134' })
        });
        setTimeout(() => {
            console.log('Sending move: Player 2 places O at [1,2]');
            client.publish({
                destination: '/app/game/move',
                body: JSON.stringify({
                    roomId: 'room134',
                    row: 1,
                    col: 2,
                    playerSymbol: 'O'
                })
            });
        }, 2000);
    },
    onStompError: (error) => {
        console.error('STOMP Error:', error);
    },
    onWebSocketError: (error) => {
        console.error('WebSocket Error:', error);
    }
});

client.activate();