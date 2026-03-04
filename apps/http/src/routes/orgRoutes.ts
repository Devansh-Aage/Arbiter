import express from "express";
import { rateLimit } from "express-rate-limit";
import { isLoggedIn } from "../middleware/isLoggedIn";
import { addAdminRole, addMember, checkIfAdmin, createOrg, deleteOrg, getBias, getDescription, getOrgById, getOrgHeaderData, getOrgMembers, getOrgOfUser, removeAdminRole, removeMember, setBias, updateDescription, updateVoteWeight } from "../controller/orgController";

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
router.get("/", isLoggedIn, getOrgOfUser);
router.get("/:orgId", isLoggedIn, getOrgById);
router.get("/:orgId/header", isLoggedIn, getOrgHeaderData);
router.get("/:orgId/members", isLoggedIn, getOrgMembers);
router.post("/add-member", isLoggedIn, addMember);
router.post("/remove-member", isLoggedIn, removeMember);
router.post("/add-admin", isLoggedIn, addAdminRole);
router.post("/remove-admin", isLoggedIn, removeAdminRole);
router.post("/vote-weight", isLoggedIn, updateVoteWeight);
router.delete("/:orgId", isLoggedIn, deleteOrg);
router.post("/bias", isLoggedIn, setBias);
router.get("/:orgId/bias", isLoggedIn, getBias);
router.get("/:orgId/description", isLoggedIn, getDescription);
router.post("/:orgId/description", isLoggedIn, updateDescription);
router.get("/:orgId/role", isLoggedIn, checkIfAdmin);

export default router;