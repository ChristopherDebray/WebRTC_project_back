export const attachRtcHandlers = (socket, connectedSockets) => {
    socket.on('rtc:new:iceCandidate', (offerObject) => {
        console.log(offerObject);
    })

    socket.on('rtc:new:offer', (offerObject) => {
        socket.emit('offerReceived', offerObject)
    })

    socket.on('rtc:new:answer', (offerObject) => {
        socket.emit('answerReceived', offerObject)
    })
}