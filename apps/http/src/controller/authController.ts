import { RequestHandler } from "express";
import { signinUser } from "@arbiter/common";
import { prisma } from "@arbiter/db";

export const signin: RequestHandler = async (req, res) => {
  try {
    const validation = signinUser.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: validation.error,
      });
      return;
    }
    const { email, wallet } = validation.data;

    const userExists = await prisma.user.findFirst({
      where: {
        wallet,
        email,
      },
    });
    if (userExists) {
      res.status(200).json({ message: "Signed In" });
      return;
    }

    await prisma.user.create({
      data: {
        email,
        wallet,
      },
    });

    res.status(201).json({ message: "User Created" });
  } catch (error) {
    console.error("Error occurred during signing in:", error);
    res.status(500).json({ message: "Error occurred while signing in." });
  }
};
