import express from 'express';
import { createServer } from "http";
import { Server, Socket } from "socket.io";

const port = 3000;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {});

io.on("connection", (socket: Socket) => {
    console.log('connected to socket : ', socket)
});

httpServer.listen(port, () => {
    console.log('listening on port : ' + port);
});