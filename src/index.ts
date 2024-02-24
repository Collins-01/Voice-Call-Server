import express, {Application} from 'express';
import http from 'http';
import { Server,Socket } from 'socket.io';


const app: Application = express();
const server = http.createServer(app);
const io = new Server(server);
const connectedUsers = new Map<string, Socket>();

// Serve static files from the 'public' directory
// app.use(express.static('public'));

// Define a connection event for new sockets
io.on('connection', (socket: Socket) => {
    console.log('A user connected');
    const userId: string | undefined = socket.handshake.query?.user_id as string | undefined;

    if (!userId) {
        // Disconnect the socket if no user_id is provided
        socket.disconnect(true);
        return;
    }

    console.log(`User ${userId} connected`);
    connectedUsers.set(userId, socket);
    console.log(`Total number of connected users ==>`, connectedUsers.size);


    // Handle a custom 'chat message' event
    socket.on('incoming_call', (data: any) => {
        console.log(`Type of incoming data: ${typeof data}`);
        //  const parsedData = JSON.parse(msg);
        // Now 'parsedData' is an object with the parsed data
        console.log('Incoming  Data:', data);
        const incomingUserID = data.user_id;
        const recieverSocket = connectedUsers.get(incomingUserID);

        if (recieverSocket !== undefined) {
            recieverSocket.emit('incoming_call', data);
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

app.get('/ping', (req, res) => {
    res.status(200).json({
        message: 'Pong',
    });
});

// Start the server on port 3000
const PORT: number = parseInt(process.env.PORT as string, 10) || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
