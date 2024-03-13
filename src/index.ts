import express, {Application, NextFunction, Request, Response} from 'express';
import http from 'http';
import { Server,Socket } from 'socket.io';
import bodyParser from 'body-parser'
import {RtcTokenBuilder, RtcRole} from 'agora-access-token'
import dotenv from 'dotenv'

const app: Application = express();
const server = http.createServer(app);
const io = new Server(server);
const connectedUsers = new Map<string, Socket>();
const INCOMING_CALL = 'incoming_call';
const REJECT_CALL = 'reject_call';


dotenv.config();
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
const nocache = (req:Request, resp:Response, next:NextFunction) => {
    resp.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    resp.header('Expires', '-1');
    resp.header('Pragma', 'no-cache');
    next();
  }

app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
app.use((req, res, next) => {
    res.status(404).json({
        message: `Not Found`
    })
  });
  
app.get('/ping', (req, res) => {
    res.status(200).json({
        message: 'Pong',
        ip: req.ip
    });
});


app.post("/generate-token",nocache,(req,res)=>{
    res.header('Access-Control-Allow-Origin', '*');
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
  const  token = RtcTokenBuilder.buildTokenWithAccount('de826356767449de8f40c9a80376fcbb', 'e4e1406eaba94c8485cbd1adfcef3389', req.body.channel, '01', RtcRole.PUBLISHER, 1800);


    return res.status(201).json({
        message: `Token generated successfully`,
        token,
        
    })
})

// Start the server on port 3000
const PORT: number = parseInt(process.env.PORT as string, 10) || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
