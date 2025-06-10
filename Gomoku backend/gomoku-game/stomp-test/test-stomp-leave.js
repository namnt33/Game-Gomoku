const Stomp = require('@stomp/stompjs');

// Client cho Player 1 (rời phòng)
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
            console.log('Player 1: Leaving room');
            client1.publish({
                destination: '/app/game/leave',
                body: JSON.stringify({
                    roomId: 'room135',
                    playerEmail: 'player1@example.com'
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

// Client cho Player 2 (nhận cập nhật trạng thái phòng)
const client2 = new Stomp.Client({
    brokerURL: 'ws://localhost:8080/ws/game?roomId=room135&token=Bearer%20eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJwbGF5ZXI2QGV4YW1wbGUuY29tIiwiaWF0IjoxNzQzMjQyMzYyLCJleHAiOjE3NDMzMjg3NjJ9.4KDgprl0SPZRkU8iQknFBK1cl2Z7AF0qj7AaT_LA2RM',
    debug: (str) => console.log('Player 2:', str),
    onConnect: () => {
        console.log('Player 2: Connected to WebSocket!');
        client2.subscribe('/topic/game/room135', (msg) => {
            console.log('Player 2 Received:', msg.body);
            const data = JSON.parse(msg.body);
            if (data.finished) {
                console.log('Player 2: Game is already finished, no need to leave');
                return;
            }
            if (data.player1 === null) {
                setTimeout(() => {
                    console.log('Player 2: Leaving room');
                    client2.publish({
                        destination: '/app/game/leave',
                        body: JSON.stringify({
                            roomId: 'room135',
                            playerEmail: 'player6@example.com'
                        })
                    });
                }, 2000);
            }
        });
        client2.publish({
            destination: '/app/game/state',
            body: JSON.stringify({ roomId: 'room135' })
        });
    },
    onStompError: (error) => {
        console.error('Player 2 STOMP Error:', error);
    },
    onWebSocketError: (error) => {
        console.error('Player 2 WebSocket Error:', error);
    }
});

client1.activate();
client2.activate();