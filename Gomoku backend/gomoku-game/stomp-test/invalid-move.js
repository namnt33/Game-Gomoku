const Stomp = require('@stomp/stompjs');

const client = new Stomp.Client({
    brokerURL: 'ws://localhost:8080/ws/game?roomId=room135&token=Bearer%20eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJwbGF5ZXIxQGV4YW1wbGUuY29tIiwiaWF0IjoxNzQzMjQyMzM3LCJleHAiOjE3NDMzMjg3Mzd9.IT_WoZ8nT4hy6OasYqZYzHOWU66uiIuK8yEw6-ObGQ0',
    debug: (str) => console.log(str),
    onConnect: () => {
        console.log('Player 1: Connected to WebSocket!');
        client.subscribe('/topic/game/room135', (msg) => {
            console.log('Received:', msg.body);
            const data = JSON.parse(msg.body);
            if (data.message) {
                console.error('Error:', data.message);
            }
        });
        client.publish({
            destination: '/app/game/state',
            body: JSON.stringify({ roomId: 'room135' })
        });

        setTimeout(() => {
            console.log('Player 1: Sending first move at [1,1]');
            client.publish({
                destination: '/app/game/move',
                body: JSON.stringify({
                    roomId: 'room135',
                    row: 1,
                    col: 1,
                    playerSymbol: 'X'
                })
            });

            setTimeout(() => {
                console.log('Player 1: Sending second move at [1,1] (should fail - position taken)');
                client.publish({
                    destination: '/app/game/move',
                    body: JSON.stringify({
                        roomId: 'room135',
                        row: 1,
                        col: 1,
                        playerSymbol: 'X'
                    })
                });
            }, 1000);
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