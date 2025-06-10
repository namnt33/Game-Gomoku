const Stomp = require('@stomp/stompjs');

const client = new Stomp.Client({
    brokerURL: 'ws://localhost:8080/ws/game?roomId=room135&token=Bearer invalid-token',
    debug: (str) => console.log(str),
    onConnect: () => {
        console.log('Connected to WebSocket!');
    },
    onStompError: (error) => {
        console.error('STOMP Error:', error);
    },
    onWebSocketError: (error) => {
        console.error('WebSocket Error:', error);
    }
});

client.activate();