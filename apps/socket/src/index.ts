import { createServer } from "http";
import { Server, Socket } from "socket.io";
import dotenv from "dotenv";
import { isAuth } from "./middleware/isAuth";
import { User } from "@arbiter/db/src/types";
import { getActiveProposals } from "./middleware/getActiveProposals";
import { voteRoutes } from "./routes/voteRoutes";

dotenv.config();

interface CustomSocket extends Socket {
    data: {
        user: User;
    };
}

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL
    },
});

io.use(isAuth);

let activeSockets = 0;

const userSockets = new Map<string, Set<CustomSocket>>();

export function getSocketsForUser(userId: string): Set<CustomSocket> {
    return userSockets.get(userId) ?? new Set();
}

io.on("connection", async (socket: CustomSocket) => {
    const user = socket.data.user;
    console.log("user", user);

    const userId = user.id;

    // socket.join(`user:${userId}`); not needed as no user specific events are being emitted

    const proposalIds = await getActiveProposals(socket);
    if (proposalIds?.length > 0) {
        proposalIds.forEach((proposalId) => {
            socket.join(`proposal:${proposalId}`);
        });
    }

    if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
    }
    userSockets.get(userId)!.add(socket);

    activeSockets += 1;
    console.log(`User ${userId} connected with socket ${socket.id}`);

    voteRoutes(socket);

    socket.on("error", (err) => {
        console.log(err);
    });

    socket.on("disconnect", () => {
        userSockets.get(userId)?.delete(socket);
        if (userSockets.get(userId)?.size === 0) {
            userSockets.delete(userId);
        }
        console.log(`User ${userId} disconnected socket ${socket.id}`);
        activeSockets -= 1;
        console.log("Active Connections: ", activeSockets);
    });
});

httpServer.listen(process.env.WS_PORT!, () => {
    console.log(`Socket Server started at port: ${process.env.WS_PORT}`);
});