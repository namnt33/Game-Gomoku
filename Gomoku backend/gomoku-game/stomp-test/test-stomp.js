const Stomp = require('@stomp/stompjs');

const client = new Stomp.Client({
    brokerURL: 'ws://localhost:8080/ws/game?roomId=room134&token=Bearer%20eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJwbGF5ZXIxQGV4YW1wbGUuY29tIiwiaWF0IjoxNzQzMjUwODkzLCJleHAiOjE3NDMzMzcyOTN9.KzoWs3TSIT6miQHqQy_M0YN0urxr0f2mnaZKFfER2xI',
    debug: (str) => console.log(str),
    onConnect: () => {
        console.log('Connected to WebSocket!');
        client.subscribe('/topic/game/room134', (msg) => {
            console.log('Received:', msg.body);
            const data = JSON.parse(msg.body);
            if (data.message) {
                console.error('Error:', data.message);
            } else {
                console.log('Current turn:', data.currentTurn);
                console.log('Board at [1,1]:', data.board[1][1]);
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
            console.log('Sending move: Player 1 places X at [1,1]');
            client.publish({
                destination: '/app/game/move',
                body: JSON.stringify({
                    roomId: 'room134',
                    row: 1,
                    col: 1,
                    playerSymbol: 'X'
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