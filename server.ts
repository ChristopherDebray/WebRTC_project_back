import express from 'express';
import { createServer } from "https";
import { Server, Socket } from "socket.io";
import * as fs from 'fs';
import cors from 'cors';

const key = fs.readFileSync('cert/create-cert-key.pem');
const cert = fs.readFileSync('cert/create-cert.pem');

const port = 3000;
var corsOptions = {
    origin: process.env.CORS_ORIGIN,
}
const ioServerOptions = {
    cors: {
        origin: process.env.CORS_ORIGIN,
    }
}

interface UserSocket {
    socketId: string,
    userName: string
}

const connectedSockets: UserSocket[] = [];

const app = express();
// cors is a middleware, so we must apply it separatly
app.use(cors(corsOptions));
const httpsServer = createServer({ key, cert }, app);
const io = new Server(httpsServer, ioServerOptions);

io.on("connection", (socket: Socket) => {
    console.log('connected to socket')
    console.log(socket.id);
    const newUser: UserSocket = {
        socketId: socket.id,
        userName: socket.handshake.auth.userName
    }
    connectedSockets.push(newUser)

    // Emit connected users to the to the newly connected user
    socket.emit('connectedUsersList', connectedSockets.filter((user) => user.socketId !== socket.id));
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
});


app.get('/', (req, res) => {
    res.send('Hello World!')
})

httpsServer.listen(port, () => {
    console.log('listening on port : ' + port);
});