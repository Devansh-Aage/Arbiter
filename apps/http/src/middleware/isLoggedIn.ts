import { RequestHandler } from "express";
import dotenv from "dotenv";
import { CdpClient } from "@coinbase/cdp-sdk";
import { prisma } from "@arbiter/db/src/client";
import { User } from "@arbiter/db/src/types";

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      user?: User;
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
      res.status(400).json({ error: "Bad Request" });
      return;
    }
    const endUser = await cdpClient.endUser.validateAccessToken({
      accessToken: token,
    });

    if (!endUser) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    let user = await prisma.user.findFirst({
      where: {
        wallet: endUser.evmSmartAccountObjects[0].address,
      }
    });

    if (!user) {
      let email;
      for (const method of endUser.authenticationMethods) {
        if (method.type === "email") {
          email = method.email
        }
        else if (method.type === "google") {
          email = method.email
        }
        else if (method.type === "x") {
          email = method.email
        }
      }
      if (!email) {
        res.status(400).json({ error: "No Email Found" });
        return;
      }
      user = await prisma.user.create({
        data: {
          email,
          wallet: endUser.evmSmartAccountObjects[0].address,
        },
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Failed: ", error);
    res.status(500).json({
      error: "Authentication check failed",
    });
  }
};
