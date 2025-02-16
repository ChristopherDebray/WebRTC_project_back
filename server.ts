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
    connectedSockets.push({
        socketId: socket.id,
        userName: socket.handshake.auth.userName
    })
    // Emit a new connected user to all other user
    io.emit('newConnectedUsers', connectedSockets)

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