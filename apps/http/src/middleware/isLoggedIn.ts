import { RequestHandler } from "express";
import dotenv from "dotenv";
import { CdpClient } from "@coinbase/cdp-sdk";
import { prisma } from "@arbiter/db";

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

if (!process.env.CDP_API_KEY_ID || !process.env.CDP_API_KEY_SECRET) {
  throw new Error("CDP_API_KEY_ID and CDP_API_KEY_SECRET must be set");
}

const cdpClient = new CdpClient({
  apiKeyId: process.env.CDP_API_KEY_ID,
  apiKeySecret: process.env.CDP_API_KEY_SECRET,
});

export const isLoggedIn: RequestHandler = async (req, res, next) => {
  try {
    const token = req.header("authToken");
    if (!token) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const endUser = await cdpClient.endUser.validateAccessToken({
      accessToken: token,
    });

    if (!endUser) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        wallet: endUser.evmSmartAccountObjects[0].address,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    req.userId = user.id;
    next();
  } catch (error) {
    console.error("Auth Middleware Failed: ", error);
    res.status(500).json({
      error: "Authentication check failed",
    });
  }
};
