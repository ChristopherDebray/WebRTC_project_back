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

const app = express();
// cors is a middleware, so we must apply it separatly
app.use(cors(corsOptions));
const httpsServer = createServer({ key, cert }, app);
const io = new Server(httpsServer, ioServerOptions);

io.on("connection", (socket: Socket) => {
    console.log('connected to socket')

    socket.on('test', () => {
        console.log('test success');
        socket.emit('testReceived')
    })
});


app.get('/', (req, res) => {
    res.send('Hello World!')
})

httpsServer.listen(port, () => {
    console.log('listening on port : ' + port);
});