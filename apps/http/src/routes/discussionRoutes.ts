import express from "express";
import { isLoggedIn } from "../middleware/isLoggedIn";
import { addDiscussionVote, createDiscussion, getDiscussions } from "../controller/discussionController";

const router = express.Router();

router.post("/", isLoggedIn, createDiscussion);
router.post("/vote", isLoggedIn, addDiscussionVote);
router.get("/:proposalId", isLoggedIn, getDiscussions);

export default router;