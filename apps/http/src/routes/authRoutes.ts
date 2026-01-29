import express from "express";
import { getUser } from "../controller/authController";
import { isLoggedIn } from "../middleware/isLoggedIn";

const router = express.Router();

router.get("/user", isLoggedIn, getUser);

export default router;