import dotenv from "dotenv";
import { Socket } from "socket.io";

dotenv.config();

export const isAuth = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    // Option 1: Get token from socket auth (recommended)
    const token = socket.handshake.auth.token;

    // Option 2: Get token from headers (alternative)
    // const token = socket.handshake.headers.authtoken;

    //Client side tokensetting
    // import { io } from 'socket.io-client';

    // const socket = io('http://localhost:3001', {
    //   auth: {
    //     token: 'your-auth-token-here'  // Gets token from localStorage/context
    //   }
    // });

    if (!token) {
      throw new Error("No authentication token provided");
    }

    const response = fetch(`${process.env.HTTP_URL}/app/auth`, {
      method: "GET",
      headers: {
        authToken: token,
        "Content-Type": "application/json",
      },
    });

    if (!(await response).ok) {
      throw new Error(`HTTP error! status: ${(await response).status}`);
    }

    const data = await (await response).json();

    socket.data.user = data.user;
    next();
  } catch (error) {
    console.error("Authentication failed:", error);
    next(new Error("Unauthorized"));
  }
};