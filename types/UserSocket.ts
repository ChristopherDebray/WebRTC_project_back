export interface UserSocket {
    socketId: string,
    userName: string,
    userColor: string,
    userInitials: string
    offer: RTCSessionDescription | null
    answer: RTCSessionDescription | null
    offererIceCandidates: RTCIceCandidate[]
    answererIceCandidates: RTCIceCandidate[]
    isCaller: boolean
}