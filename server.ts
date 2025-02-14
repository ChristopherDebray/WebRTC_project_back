import express from 'express';
import { createServer } from "https";
import { Server, Socket } from "socket.io";
import * as fs from 'fs';

const key = fs.readFileSync('cert/create-cert-key.pem');
const cert = fs.readFileSync('cert/create-cert.pem');

const port = 3000;
const app = express();
const httpsServer = createServer({ key, cert }, app);
const io = new Server(httpsServer, {});

io.on("connection", (socket: Socket) => {
    console.log('connected to socket : ', socket)
});

app.get('/', (req, res) => {
    res.send('Hello World!')
})

httpsServer.listen(port, () => {
    console.log('listening on port : ' + port);
});