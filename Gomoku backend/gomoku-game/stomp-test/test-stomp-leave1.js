const Stomp = require('@stomp/stompjs');

const client1 = new Stomp.Client({
    brokerURL: 'ws://localhost:8080/ws/game?roomId=room135&token=Bearer%20eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJwbGF5ZXIxQGV4YW1wbGUuY29tIiwiaWF0IjoxNzQzMjQyMzM3LCJleHAiOjE3NDMzMjg3Mzd9.IT_WoZ8nT4hy6OasYqZYzHOWU66uiIuK8yEw6-ObGQ0',
    debug: (str) => console.log('Player 1:', str),
    onConnect: () => {
        console.log('Player 1: Connected to WebSocket!');
        client1.subscribe('/topic/game/room135', (msg) => {
            console.log('Player 1 Received:', msg.body);
        });
        client1.publish({
            destination: '/app/game/state',
            body: JSON.stringify({ roomId: 'room135' })
        });
        setTimeout(() => {
            console.log('Player 1: Leaving room with invalid email');
            client1.publish({
                destination: '/app/game/leave',
                body: JSON.stringify({
                    roomId: 'room135',
                    playerEmail: 'invalid@example.com'
                })
            });
        }, 2000);
    },
    onStompError: (error) => {
        console.error('Player 1 STOMP Error:', error);
    },
    onWebSocketError: (error) => {
        console.error('Player 1 WebSocket Error:', error);
    }
});

client1.activate();