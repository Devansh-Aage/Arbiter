import express from "express";
import { rateLimit } from "express-rate-limit";
import { isLoggedIn } from "../middleware/isLoggedIn";
import { createOrg } from "../controller/orgController";

const router = express.Router();

const limiter = rateLimit({
    limit: 5,
    windowMs: 10 * 60 * 1000, //10 Min
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (req, res) => {
        res
            .status(429)
            .json({ message: "Too many requests! Please come back later." });
        return;
    },
});

router.post("/create", limiter, isLoggedIn, createOrg);

export default router;