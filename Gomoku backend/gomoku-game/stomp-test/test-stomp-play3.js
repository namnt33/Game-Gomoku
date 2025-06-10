const Stomp = require('@stomp/stompjs');

const client = new Stomp.Client({
    brokerURL: 'ws://localhost:8080/ws/game?roomId=room135&token=Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJwbGF5ZXIxQGV4YW1wbGUuY29tIiwiaWF0IjoxNzQzMjQyMzM3LCJleHAiOjE3MDAwMDAwMDB9.8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8',
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