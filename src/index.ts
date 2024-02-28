import express, {Application} from 'express';
import http from 'http';
import { Server,Socket } from 'socket.io';
import bodyParser, {BodyParser} from 'body-parser'

const app: Application = express();
const server = http.createServer(app);
const io = new Server(server);
const connectedUsers = new Map<string, Socket>();
const INCOMING_CALL = 'incoming_call';
const REJECT_CALL = 'reject_call';


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


    // Handle a custom 'incoming call' event
    socket.on(INCOMING_CALL, (data: any) => {
        console.log(`Type of incoming data from ${INCOMING_CALL}: ${typeof data}`);
        
        console.log('Incoming  Data:', data);
        const incomingUserID = data.user_id;
        const recieverSocket = connectedUsers.get(incomingUserID);

        if (recieverSocket !== undefined) {
            recieverSocket.emit(INCOMING_CALL, data);
        }
        
    });

    socket.on(REJECT_CALL, (data:any)=>{
        console.log(`Type of incoming data from ${REJECT_CALL}: ${typeof data}`);
        console.log('Incoming  Data:', data);
        const incomingUserID = data.user_id;
        const recieverSocket = connectedUsers.get(incomingUserID);

        if (recieverSocket !== undefined) {
            recieverSocket.emit(REJECT_CALL, {
                'message': 'call was rejected'
            });
        }

    })

    // Handle the disconnect event
    socket.on('disconnect', () => {
        console.log('User disconnected');
        console.log(`User ${userId} disconnected`);

        // Remove the socket connection from the map
        connectedUsers.delete(userId);
    });
});

app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
app.get('/ping', (req, res) => {
    res.status(200).json({
        message: 'Pong',
    });
});

app.post("/generate-token",(req,res)=>{
    if(!req.body){
        return res.status(400).json({
            message : `Channel name is required `
        })
    }
    
    if(!req.body.channel){
        return res.status(400).json({
            message : `Please attach a valid channel name is required `
        })
    }
 const   AGORA_TOKEN = '007eJxTYBASenjV1H3y3hj5uF/79sp6rd8hsKbr8xIbX4f/+3U91p1VYEhJtTAyMzY1MzczNzGxBPLSTAySLRMtDIzNzdKSk5JaZO+nNgQyMsRWMTIyMkAgiM/PEJafmZyq65yYk6Prkpqbz8AAALxHIsY='

    return res.status(201).json({
        message: `Token generated successfully`,
        token: AGORA_TOKEN,
    })
})

// Start the server on port 3000
const PORT: number = parseInt(process.env.PORT as string, 10) || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
