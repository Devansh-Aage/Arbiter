import { Socket } from "socket.io";
import { prisma } from "@arbiter/db/src/client";
import { ProposalStatus } from "@arbiter/db/generated/prisma/enums";
export const getActiveProposals = async (socket: Socket) => {
    try {
        const user = socket.data.user;
        if (!user) {
            console.error("Missing User!");
            return [];
        }
        const userId = user.id;
        const rawOrgIds = await prisma.membership.findMany({
            where: {
                userId
            },
            select: {
                orgId: true
            }
        })
        const orgIds = rawOrgIds.map((org) => org.orgId);
        const proposals = await prisma.proposal.findMany({
            where: {
                orgId: {
                    in: orgIds
                },
                proposalStatus: {
                    in: [ProposalStatus.ACTIVE, ProposalStatus.UPCOMING]
                }
            },
            select: {
                id: true,
            }
        })
        const proposalIds = proposals.map((proposal) => proposal.id);
        return proposalIds;
    } catch (error) {
        console.error("Failed to fetch active proposals!: ", error);
        return [];
    }
}