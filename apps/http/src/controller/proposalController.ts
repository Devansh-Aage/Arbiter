import { OrgIdValidation, ProposalIdValidation } from "@arbiter/common";
import { prisma } from "@arbiter/db/src/client";
import { RequestHandler } from "express";


export const getProposalByOrg: RequestHandler = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(404).json({ message: "User not found!" });
            return;
        }
        const paramsValidation = OrgIdValidation.safeParse(req.params);
        if (!paramsValidation.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: paramsValidation.error,
            });
            return;
        }
        const { orgId } = paramsValidation.data;
        const userMembership = await prisma.membership.findFirst({
            where: {
                orgId: orgId,
                userId: user.id,
            },
            select: {
                role: true
            }
        })
        if (!userMembership) {
            res.status(401).json({ message: "You are not a member of this organization" });
            return;
        }
        const proposals = await prisma.proposal.findMany({
            where: {
                orgId,
            },
            select: {
                id: true,
                title: true,
                proposalStatus: true,
                deadline: true,
                createdAt: true,
                _count: {
                    select: { votes: true }
                }
            }
        })
        res.status(200).json({ proposals });
    } catch (error) {
        console.error("Error occurred getting proposals by organization", error);
        res
            .status(500)
            .json({ message: "Error occurred getting proposals by organization" });
    }
}

export const getProposalById: RequestHandler = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(404).json({ message: "User not found!" });
            return;
        }
        const paramsValidation = ProposalIdValidation.safeParse(req.params);
        if (!paramsValidation.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: paramsValidation.error,
            });
            return;
        }
        const { proposalId } = paramsValidation.data;
        const proposal = await prisma.proposal.findUnique({
            where: {
                id: proposalId,
            },
            include: {
                proposalChoices: {
                    select: {
                        id: true,
                        value: true,
                        _count: {
                            select: {
                                votes: true
                            }
                        }
                    }
                }
            }
        })
        if (!proposal) {
            res.status(404).json({ message: "Proposal not found" });
            return;
        }

        const userMembership = await prisma.membership.findFirst({
            where: {
                orgId: proposal.orgId,
                userId: user.id,
            },
            select: {
                role: true
            }
        })
        if (!userMembership) {
            res.status(401).json({ message: "You are not authorized to access this proposal" });
            return;
        }
        const formattedProposal = {
            ...proposal,
            proposalChoices: proposal.proposalChoices.map((choice) => ({
                id: choice.id,
                text: choice.value,
                votes: choice._count.votes,
            })),
        };
        res.status(200).json({ proposal: formattedProposal });
    } catch (error) {
        console.error("Error occurred getting proposal by id", error);
        res
            .status(500)
            .json({ message: "Error occurred getting proposal by id" });
    }
}

export const closeProposal: RequestHandler = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(404).json({ message: "User not found!" });
            return;
        }
        const validation = ProposalIdValidation.safeParse(req.params);
        if (!validation.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: validation.error,
            });
            return;
        }
        const { proposalId } = validation.data;
        const orgId = await prisma.proposal.findUnique({
            where: {
                id: proposalId
            },
            select: {
                orgId: true
            }
        })
        if (!orgId) {
            res.status(404).json({ message: "Proposal not found" });
            return;
        }
        const userMembership = await prisma.membership.findFirst({
            where: {
                userId: user.id,
                orgId: orgId.orgId,
            },
            select: {
                role: true
            }
        })
        const isAuthorized = userMembership?.role === "CREATOR" || userMembership?.role === "ADMIN";
        if (!isAuthorized) {
            res.status(403).json({ message: "You are not authorized to add members to this organization" });
            return;
        }
        await prisma.proposal.update({
            where: {
                id: proposalId,
            },
            data: {
                proposalStatus: "CLOSED"
            }
        })
        res.status(200).json({ message: "Closed the Proposal" })
    } catch (error) {
        console.error("Error occurred closing proposal by id", error);
        res
            .status(500)
            .json({ message: "Error occurred closing proposal by id" });
    }
}
export const deleteProposal: RequestHandler = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(404).json({ message: "User not found!" });
            return;
        }
        const validation = ProposalIdValidation.safeParse(req.params);
        if (!validation.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: validation.error,
            });
            return;
        }
        const { proposalId } = validation.data;
        const orgId = await prisma.proposal.findUnique({
            where: {
                id: proposalId
            },
            select: {
                orgId: true
            }
        })
        if (!orgId) {
            res.status(404).json({ message: "Proposal not found" });
            return;
        }
        const userMembership = await prisma.membership.findFirst({
            where: {
                userId: user.id,
                orgId: orgId.orgId,
            },
            select: {
                role: true
            }
        })
        const isAuthorized = userMembership?.role === "CREATOR" || userMembership?.role === "ADMIN";
        if (!isAuthorized) {
            res.status(403).json({ message: "You are not authorized to add members to this organization" });
            return;
        }
        await prisma.proposal.delete({
            where: {
                id: proposalId,
            }
        })
        res.status(200).json({ message: "Deleted the Proposal" })
    } catch (error) {
        console.error("Error occurred closing proposal by id", error);
        res
            .status(500)
            .json({ message: "Error occurred closing proposal by id" });
    }
}

export const getVoteTableData: RequestHandler = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(404).json({ message: "User not found!" });
            return;
        }
        const validation = ProposalIdValidation.safeParse(req.params);
        if (!validation.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: validation.error,
            });
            return;
        }
        const { proposalId } = validation.data;
        const orgId = await prisma.proposal.findUnique({
            where: {
                id: proposalId
            },
            select: {
                orgId: true
            }
        })
        if (!orgId) {
            res.status(404).json({ message: "Proposal not found" });
            return;
        }
        const userMembership = await prisma.membership.findFirst({
            where: {
                userId: user.id,
                orgId: orgId.orgId,
            },
            select: {
                role: true
            }
        })
        if (!userMembership) {
            res.status(401).json({ message: "You are not authorized to access this proposal" });
            return;
        }

        const votes = await prisma.vote.findMany({
            where: {
                proposalId
            },
            include: {
                choice: true,
                user: {
                    select: {
                        email: true,
                        wallet: true
                    }
                }
            }
        })
        const voteData = votes.map((vote) => ({
            id: vote.id,
            choice: vote.choice.value,
            voteValue: vote.voteValue,
            votedAt: vote.votedAt,
            user: vote.user.email,
            wallet: vote.user.wallet
        }))
        res.status(200).json({ voteData });
    } catch (error) {
        console.error("Error occurred getting vote table data", error);
        res
            .status(500)
            .json({ message: "Error occurred getting vote table data" });
    }
}

export const getUserChoice: RequestHandler = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(404).json({ message: "User not found!" });
            return;
        }
        const paramsValidation = ProposalIdValidation.safeParse(req.params);
        if (!paramsValidation.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: paramsValidation.error,
            });
            return;
        }
        const { proposalId } = paramsValidation.data;
        const userChoice = await prisma.vote.findFirst({
            where: {
                proposalId,
                userId: user.id,
            }
        })
        res.status(200).json({ userChoice });
    } catch (error) {
        console.error("Error occurred getting proposal by id", error);
        res
            .status(500)
            .json({ message: "Error occurred getting user choice" });
    }
}