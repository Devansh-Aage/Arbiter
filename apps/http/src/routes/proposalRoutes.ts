import express from "express";
import { isLoggedIn } from "../middleware/isLoggedIn";
import { addChatMessage, closeProposal, deleteProposal, getChatMessages, getProposalById, getProposalByOrg, getUserChoice, getVoteTableData } from "../controller/proposalController";

const router = express.Router();

router.get("/org/:orgId", isLoggedIn, getProposalByOrg);
router.get("/:proposalId", isLoggedIn, getProposalById);
router.get("/:proposalId/user-choice", isLoggedIn, getUserChoice);
router.post("/:proposalId/close", isLoggedIn, closeProposal);
router.post("/chat", isLoggedIn, addChatMessage);
router.get("/:proposalId/chat", isLoggedIn, getChatMessages);
router.get("/:proposalId/vote", isLoggedIn, getVoteTableData);
router.delete("/:proposalId", isLoggedIn, deleteProposal);

export default router;