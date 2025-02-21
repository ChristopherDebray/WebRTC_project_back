import { Socket } from "socket.io"
import { UserSocket } from "../types/UserSocket"

export const attachCallHandlers = (socket, connectedSockets) => {
    socket.on('call:new', (calledUser: UserSocket, callingUser: UserSocket) => {
        const calledSocket: Socket | undefined = connectedSockets.find((socket) => socket.handshake.auth.userName === calledUser.userName)
        if (!calledSocket) {
            return
        }
        calledSocket.emit('call:receive', callingUser)
    })

    socket.on('call:cancel', (calledUser: UserSocket) => {
        const calledUserSocket: Socket | undefined = connectedSockets.find((socket) => socket.handshake.auth.userName === calledUser.userName)
        if (!calledUserSocket) {
            return
        }
        calledUserSocket.emit('call:cancelled')
    })

    socket.on('call:accept', (callingUser: UserSocket) => {
        const calledSocket: Socket | undefined = connectedSockets.find((socket) => socket.handshake.auth.userName === callingUser.userName)
        if (!calledSocket) {
            return;
        }
        calledSocket.emit('call:accepted')
    })

    socket.on('call:reject', (callingUser: UserSocket) => {
        const calledUserSocket: Socket | undefined = connectedSockets.find((socket) => socket.handshake.auth.userName === callingUser.userName)
        if (!calledUserSocket) {
            return;
        }
        calledUserSocket.emit('call:rejected')
    })

    socket.on('call:stop', (callingUser: UserSocket) => {
        const calledUserSocket: Socket | undefined = connectedSockets.find((socket) => socket.handshake.auth.userName === callingUser.userName)
        if (!calledUserSocket) {
            return;
        }
        calledUserSocket.emit('call:stopped')
    })
}