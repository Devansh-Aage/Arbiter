import { Socket } from "socket.io";
import z from "zod";
import { addVoteValidation } from "@arbiter/common/src/zodWsSchemas";
import { ADD_VOTE_RES, VOTE_ADDED_EVENT } from "@arbiter/common/src/eventConstants";
import { prisma } from "@arbiter/db/src/client";


type addVotePayload = z.infer<typeof addVoteValidation>

export const addVote = async (socket: Socket, rawPayload: addVotePayload) => {
    try {
        const dataValidation = addVoteValidation.safeParse(rawPayload);
        if (!dataValidation.success) {
            console.error(dataValidation.error?.issues);
            socket.emit(ADD_VOTE_RES, "Invalid Payload!");
            return;
        }
        const user = socket.data.user;
        if (!user) {
            console.error("User not found!");
            socket.emit(ADD_VOTE_RES, "User not found!");
            return;
        }
        const userId = user.id;
        const { choiceId, proposalId, signature, hash } = dataValidation.data;

        const proposal = await prisma.proposal.findFirst({
            where: {
                id: proposalId,
                proposalStatus: "ACTIVE"
            }
        })
        if (!proposal) {
            socket.emit(ADD_VOTE_RES, "Proposal not found or not active");
            return;
        }

        const membership = await prisma.membership.findFirst({
            where: {
                userId,
                orgId: proposal.orgId
            }
        })
        if (!membership) {
            socket.emit(ADD_VOTE_RES, "You are not a member of this organization");
            return;
        }

        const choice = await prisma.proposalChoice.findFirst({
            where: {
                id: choiceId,
                proposalId: proposalId
            }
        })
        if (!choice) {
            socket.emit(ADD_VOTE_RES, "Choice not found");
            return;
        }
        const voteValue = 1 * membership.voteWeight;

        const vote = await prisma.vote.create({
            data: {
                proposalId,
                choiceId,
                userId,
                signature,
                voteValue,
                hash
            }
        })
        socket.to(`proposal:${proposalId}`).emit(VOTE_ADDED_EVENT, vote)
        socket.emit(ADD_VOTE_RES, "Vote added successfully");
    } catch (error) {
        console.error("Error while adding vote: ", error);
        if (process.env.NODE_ENV !== "production") {
            socket.emit("error", error);
        } else {
            socket.emit("error", "Something went wrong! Try again after some time");
        }
    }
}