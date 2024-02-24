const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const connectedUsers = new Map();


// Serve static files from the 'public' directory
app.use(express.static('public'));

// Define a connection event for new sockets
io.on('connection', (socket) => {
    console.log('A user connected');
    const userId = socket.handshake.query.user_id;

    if (!userId) {
        // Disconnect the socket if no user_id is provided
        socket.disconnect(true);
        return;
    }


    console.log(`User ${userId} connected`);
    connectedUsers.set(userId,socket);

    // Handle a custom 'chat message' event
    socket.on('incoming_call', (msg) => {

        console.log(`message: ${{msg}}`);
        incomingUserID = 1010
        recieverSocket= connectedUsers.get(incomingUserID)
        if (recieverSocket !== undefined){ 
            recieverSocket.emit('incoming_call', msg)
        }
        


        // io.emit('incoming_call', msg);
    });

    // Handle the disconnect event
    socket.on('disconnect', () => {
        console.log('User disconnected');
        console.log(`User ${userId} disconnected`);

        // Remove the socket connection from the map
        connectedUsers.delete(userId);

    });
});

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
