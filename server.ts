import express from 'express';
import { createServer } from "https";
import { Server, Socket } from "socket.io";
import * as fs from 'fs';
import cors from 'cors';

const key = fs.readFileSync('cert/create-cert-key.pem');
const cert = fs.readFileSync('cert/create-cert.pem');

const port = 3000;
const corsOptions = {
    origin: process.env.CORS_ORIGIN,
}
const ioServerOptions = {
    cors: corsOptions
}

interface UserSocket {
    socketId: string,
    userName: string,
    userColor: string,
    userInitials: string
}

const connectedSockets: Socket[] = [];
const connectedUserSockets: UserSocket[] = [];

const app = express();
// cors is a middleware, so we must apply it separatly
app.use(cors(corsOptions));
const httpsServer = createServer({ key, cert }, app);
const io = new Server(httpsServer, ioServerOptions);

io.on("connection", (socket: Socket) => {
    const newUser: UserSocket = {
        socketId: socket.id,
        userName: socket.handshake.auth.userName,
        userColor: socket.handshake.auth.userColor,
        userInitials: socket.handshake.auth.userInitials,
    }
    connectedSockets.push(socket)
    connectedUserSockets.push(newUser)
    

    // Emit connected users to the to the newly connected user
    socket.emit('connectedUsersList', connectedUserSockets.filter((connectedSocket) => connectedSocket.socketId !== socket.id));
    // Broadcast new user to others
    socket.broadcast.emit('newConnectedUser', newUser);

    socket.on('newIceCandidate', (offerObject) => {
        console.log(offerObject);
    })

    socket.on('offerAwaiting', (offerObject) => {
        socket.emit('offerReceived', offerObject)
    })

    socket.on('answerAwaiting', (offerObject) => {
        socket.emit('answerReceived', offerObject)
    })

    socket.on('callUser', (calledUser: UserSocket, callingUser: UserSocket) => {
        const calledUserSocket: Socket | undefined = connectedSockets.find((socket) => socket.id === calledUser.socketId)
        if (!calledUserSocket) {
            return
        }
        calledUserSocket.emit('callingUser', callingUser)
        
    })

    socket.on('cancelCall', (calledUser: UserSocket) => {
        const calledUserSocket: Socket | undefined = connectedSockets.find((socket) => socket.id === calledUser.socketId)
        if (!calledUserSocket) {
            return
        }
        calledUserSocket.emit('canceledCall')
    })

    socket.on('acceptCall', (callingUser: UserSocket) => {
        const calledUserSocket: Socket | undefined = connectedSockets.find((socket) => socket.id === callingUser.socketId)
        if (!calledUserSocket) {
            return;
        }
        calledUserSocket.emit('acceptedCall')
    })

    socket.on('rejectCall', (callingUser: UserSocket) => {
        const calledUserSocket: Socket | undefined = connectedSockets.find((socket) => socket.id === callingUser.socketId)
        if (!calledUserSocket) {
            return;
        }
        calledUserSocket.emit('callRejected')
    })
});


app.get('/', (req, res) => {
    res.send('Hello World!')
})

httpsServer.listen(port, () => {
    console.log('listening on port : ' + port);
});