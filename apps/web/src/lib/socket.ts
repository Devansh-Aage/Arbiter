import { Socket, io } from "socket.io-client";

const socket: Socket = io(import.meta.env.VITE_WS_URL, {
    autoConnect: false,
});

export default socket;