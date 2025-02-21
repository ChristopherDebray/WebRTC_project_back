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
    const { userName, userColor, userInitials } = socket.handshake.auth;

    /**
     * Find and remove the socket from the connected sockets
     * We replace the socket in the connectedusersocket but not the one in the connected sockets
     */
    const existingUserIndex = connectedSockets.findIndex(user => user.handshake.auth.userName === userName);
    connectedSockets.push(socket)

    if (existingUserIndex >= 0) {
        connectedSockets.splice(existingUserIndex, 1);
        const connectedUserSocket = connectedUserSockets.find(user => user.userName === userName);
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
        socket.broadcast.emit('newConnectedUser', newUser);
    }

    // Emit connected users to the to the newly connected user
    socket.emit('connectedUsersList', connectedUserSockets.filter((connectedUserSocket) => connectedUserSocket.userName !== socket.handshake.auth.userName));

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
        const calledUserSocket: UserSocket | undefined = connectedUserSockets.find((socket) => socket.userName === calledUser.userName)
        const calledSocket: Socket | undefined = connectedSockets.find((socket) => socket.id === calledUserSocket.socketId)
        if (!calledSocket) {
            return
        }
        calledSocket.emit('callingUser', callingUser)
    })

    socket.on('cancelCall', (calledUser: UserSocket) => {
        const calledUserSocket: Socket | undefined = connectedSockets.find((socket) => socket.handshake.auth.userName === calledUser.userName)
        if (!calledUserSocket) {
            return
        }
        calledUserSocket.emit('canceledCall')
    })

    socket.on('acceptCall', (callingUser: UserSocket) => {
        const calledUserSocket: UserSocket | undefined = connectedUserSockets.find((socket) => socket.userName === callingUser.userName)
        const calledSocket: Socket | undefined = connectedSockets.find((socket) => socket.id === calledUserSocket.socketId)
        console.log(connectedUserSockets);
        console.log(calledUserSocket);
        
        if (!calledSocket) {
            return;
        }
        calledSocket.emit('acceptedCall')
    })

    socket.on('rejectCall', (callingUser: UserSocket) => {
        const calledUserSocket: Socket | undefined = connectedSockets.find((socket) => socket.handshake.auth.userName === callingUser.userName)
        if (!calledUserSocket) {
            return;
        }
        calledUserSocket.emit('callRejected')
    })

    socket.on('stopCall', (callingUser: UserSocket) => {
        const calledUserSocket: Socket | undefined = connectedSockets.find((socket) => socket.handshake.auth.userName === callingUser.userName)
        if (!calledUserSocket) {
            return;
        }
        calledUserSocket.emit('callStopped')
    })
});


app.get('/', (req, res) => {
    res.send('Hello World!')
})

httpsServer.listen(port, () => {
    console.log('listening on port : ' + port);
});