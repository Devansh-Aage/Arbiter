import express from "express";
import { isLoggedIn } from "../middleware/isLoggedIn";
import { getProposalByOrg } from "../controller/proposalController";

const router = express.Router();

router.get("/:orgId", isLoggedIn, getProposalByOrg);

export default router;