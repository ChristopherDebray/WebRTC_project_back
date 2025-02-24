import express from 'express';
import { createServer } from "https";
import { Server, Socket } from "socket.io";
import * as fs from 'fs';
import cors from 'cors';
import { attachCallHandlers } from './handlers/callHandlers';
import { attachSignalingHandlers } from './handlers/signalingHandlers';
import { UserSocket } from './types/UserSocket';

const key = fs.readFileSync('cert/create-cert-key.pem');
const cert = fs.readFileSync('cert/create-cert.pem');

const port = 3000;
const corsOptions = {
    origin: process.env.CORS_ORIGIN,
}
const ioServerOptions = {
    cors: corsOptions
}

const connectedSockets: Socket[] = [];
const connectedUserSockets: UserSocket[] = [];

const app = express();
// cors is a middleware, so we must apply it separatly
app.use(cors(corsOptions));
const httpsServer = createServer({ key, cert }, app);
const io = new Server(httpsServer, ioServerOptions);

io.on("connection", (socket: Socket) => {
    const { userName, userColor, userInitials } = socket.handshake.auth;
    /**
     * For existing user on page refresh we reconnect to socket server and replace his associated socket
     */
    const existingUserIndex: number = connectedSockets.findIndex(user => user.handshake.auth.userName === userName);
    connectedSockets.push(socket)

    // If no index found findIndex returns -1
    if (existingUserIndex >= 0) {
        connectedSockets.splice(existingUserIndex, 1);
        const connectedUserSocket: UserSocket | undefined = connectedUserSockets.find(user => user.userName === userName);
        connectedUserSocket.socketId = socket.id
    } else {
        const newUser: UserSocket = {
            socketId: socket.id,
            userName: userName,
            userColor: userColor,
            userInitials: userInitials,
        }
    
        connectedUserSockets.push(newUser)
        // Broadcast new user to others
        socket.broadcast.emit('user:new', newUser);
    }

    // Emit connected users to the to the newly connected user
    socket.emit('user:list', connectedUserSockets.filter((connectedUserSocket) => connectedUserSocket.userName !== socket.handshake.auth.userName));

    attachCallHandlers(socket, connectedSockets);
    attachSignalingHandlers(socket, connectedSockets);
});

httpsServer.listen(port, () => {
    console.log('listening on port : ' + port);
});