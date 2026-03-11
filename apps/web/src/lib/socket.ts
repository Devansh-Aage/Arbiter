import { Socket, io } from "socket.io-client";

type GetAccessToken = () => Promise<string | null | undefined>;

const socket: Socket = io(import.meta.env.VITE_WS_URL, {
    autoConnect: false,
});

export const connectSocketWithToken = async (getAccessToken: GetAccessToken) => {
    const token = await getAccessToken();
    socket.auth = { token };

    if (!socket.connected) {
        socket.connect();
    }
};

export default socket;