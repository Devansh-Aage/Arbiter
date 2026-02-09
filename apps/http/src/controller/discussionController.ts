import { createDiscussionValidation, discussionVoteValidation, getDiscussionsValidation } from "@arbiter/common";
import { prisma } from "@arbiter/db/src/client";
import { RequestHandler } from "express";

export const createDiscussion: RequestHandler = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(404).json({ message: "User not found!" });
            return;
        }

        const validation = createDiscussionValidation.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: validation.error,
            });
            return;
        }
        const { proposalId, text, userId, parentId } = validation.data;

        const proposal = await prisma.proposal.findFirst({
            where: { id: proposalId, proposalStatus: "ACTIVE" },
            select: {
                orgId: true
            }
        })
        if (!proposal) {
            res.status(400).json({
                message: "Proposal Not found or is inactive!"
            })
            return;
        }

        const isMember = await prisma.membership.findFirst({
            where: {
                orgId: proposal.orgId,
                userId
            }
        })
        if (!isMember) {
            res.status(400).json({
                message: "Not an Org Member!"
            })
            return;
        }

        if (parentId) {
            const parentDiscussion = await prisma.discussion.findUnique({
                where: {
                    id: parentId
                }
            })
            if (!parentDiscussion) {
                res.status(400).json({
                    message: "Parent Discussion doesn't exist!"
                })
                return;
            }
        }

        await prisma.discussion.create({
            data: {
                text,
                parentId,
                proposalId,
                userId,
            }
        })

        res.status(201).json({
            message: "Created discussion!"
        })
    } catch (error) {
        console.error("Error occurred creating a discussion", error);
        res
            .status(500)
            .json({ message: "Error occurred creating a discussion" });
    }
}

export const addDiscussionVote: RequestHandler = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(404).json({ message: "User not found!" });
            return;
        }

        const validation = discussionVoteValidation.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: validation.error,
            });
            return;
        }
        const { discussionId, type, userId } = validation.data;

        const discussion = await prisma.discussion.findUnique({
            where: {
                id: discussionId
            },
            select: {
                proposal: {
                    select: {
                        orgId: true,
                        proposalStatus: true
                    }
                }
            }
        });
        if (!discussion) {
            res.status(400).json({ message: "No discussion found!" })
            return
        }

        const isProposalActive = discussion.proposal.proposalStatus === "ACTIVE";
        if (!isProposalActive) {
            res.status(400).json({
                message: "Proposal not in active status!"
            })
            return
        }

        const isOrgMember = await prisma.membership.findFirst({
            where: {
                orgId: discussion.proposal.orgId,
                userId
            }
        });
        if (!isOrgMember) {
            res.status(400).json({
                message: "Not an Org Member!"
            })
            return;
        }

        const discussionVote = await prisma.discussionVote.findFirst({
            where: {
                userId,
                discussionId
            }
        });

        if (discussionVote) {
            if (discussionVote.type === type) {
                res.status(400).json({
                    message: `Already ${type} Voted`
                })
                return
            }
            else {
                await prisma.discussionVote.delete({
                    where: {
                        id: discussionVote.id
                    }
                })
            }
        }
        await prisma.discussionVote.create({
            data: {
                discussionId,
                userId,
                type
            }
        })
        res.status(201).json({
            message: "Discussion Vote Added"
        })
    } catch (error) {
        console.error("Error occurred adding a vote for discussion", error);
        res
            .status(500)
            .json({ message: "Error occurred adding a vote for  discussion" });
    }
}

export const getDiscussions: RequestHandler = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(404).json({ message: "User not found!" });
            return;
        }

        const validation = getDiscussionsValidation.safeParse(req.params);
        if (!validation.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: validation.error,
            });
            return;
        }
        const { proposalId } = validation.data;

        const rawDiscussions = await prisma.discussion.findMany({
            where: {
                proposalId
            },
            select: {
                id: true,
                text: true,
                user: {
                    select: {
                        email: true
                    }
                },
                parent: {
                    select: {
                        user: {
                            select: {
                                email: true
                            }
                        },
                        text: true
                    }
                },
                discussionVotes: {
                    select: {
                        type: true
                    }
                },
                _count: {
                    select: {
                        replies: true
                    }
                }
            },
        });

        const discussions = rawDiscussions.map((d) => {
            const upVoteCount = d.discussionVotes.filter((f) => f.type === "UP").length
            const downVoteCount = d.discussionVotes.filter((f) => f.type === "DOWN").length
            return {
                id: d.id,
                text: d.text,
                user: d.user.email,
                parentUser: d.parent?.user,
                parentText: d.parent?.text,
                upVoteCount,
                downVoteCount,
                replyCount: d._count.replies
            }
        })

        res.status(200).json({ discussions })
    } catch (error) {
        console.error("Error occurred getting the discussions", error);
        res
            .status(500)
            .json({ message: "Error occurred getting the discussions" });
    }
}