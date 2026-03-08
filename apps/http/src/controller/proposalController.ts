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
        res.status(200).json({ proposal });
    } catch (error) {
        console.error("Error occurred getting proposal by id", error);
        res
            .status(500)
            .json({ message: "Error occurred getting proposal by id" });
    }
}