import { RequestHandler } from "express";

export const getUser: RequestHandler = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(404).json({ message: "User not found!" });
      return;
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error occurred while getting user:", error);
    res.status(500).json({ message: "Error occurred while getting user." });
  }
}