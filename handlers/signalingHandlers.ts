import { Socket } from "socket.io";
import { UserSocket } from "../types/UserSocket";

export const attachSignalingHandlers = (socket, connectedSockets) => {
    socket.on('rtc:send:offer', (targetUser: UserSocket, candidate) => {
        console.log("rtc:send:offer");
        const calledUserSocket: Socket | undefined = connectedSockets.find((ssocket) => ssocket.handshake.auth.userName === targetUser.userName)
        
        console.log(targetUser)
        console.log(calledUserSocket?.handshake?.auth?.userName)
        if (!calledUserSocket) {
            return;
        }
        
        calledUserSocket.emit('rtc:receive:offer', candidate)
    })

    socket.on('rtc:send:answer', (targetUser: UserSocket, candidate) => {
        const calledUserSocket: Socket | undefined = connectedSockets.find((socket) => socket.handshake.auth.userName === targetUser.userName)
        if (!calledUserSocket) {
            return;
        }
        calledUserSocket.emit('rtc:receive:answer', candidate)
    })

    socket.on('rtc:send:iceCandidate', (targetUser: UserSocket, rTCSessionDescription) => {
        const calledUserSocket: Socket | undefined = connectedSockets.find((socket) => socket.handshake.auth.userName === targetUser.userName)
        if (!calledUserSocket) {
            return;
        }
        calledUserSocket.emit('rtc:receive:iceCandidate', rTCSessionDescription)
    })
}