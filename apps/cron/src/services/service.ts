import { prisma } from "@arbiter/db/src/client";
export const checkProposal = async () => {
    try {
        const proposals = await prisma.proposal.findMany({
            where: {
                deadline: {
                    lte: new Date()
                },
                proposalStatus: "ACTIVE"
            }
        })
        if (proposals.length === 0) return;
        for (const proposal of proposals) {
            const deadline = proposal.deadline;
            const now = new Date();
            if (now.getTime() >= deadline.getTime()) {
                updateProposal(proposal.id);
            }
        }
        console.log("Proposals checked", proposals.length);
    } catch (error) {
        console.error("Error occurred while checking proposal", error);
    }

}

export const updateProposal = async (proposalId: string) => {
    try {
        const proposal = await prisma.proposal.findUnique({
            where: { id: proposalId },
        })
        if (!proposal) return;

        const votes = await prisma.vote.groupBy({
            by: ["choiceId", "voteValue"],
            orderBy: {
                voteValue: "desc"
            },
            where: {
                proposalId: proposalId
            }
        })

        try {
            const form = new FormData();
            form.append("proposal_id", proposalId);
            const res = await fetch(`${process.env.FASTAPI_URL}generate-org-context`, {
                method: "POST",
                body: form,
            })
            const data = await res.json();
            console.log("Org context generated", data);
        } catch (error) {
            console.error("Error occurred while generating org context", error);
        }

        const totalVotes = votes.reduce((acc, vote) => acc + vote.voteValue, 0);
        const winningChoice = votes[0];
        await prisma.proposalResult.create({
            data: {
                proposalId: proposalId,
                totalVotes: totalVotes,
                winningChoiceId: winningChoice.choiceId
            }
        })

        await prisma.proposal.update({
            data: {
                proposalStatus: "COMPLETED"
            },
            where: { id: proposalId }
        })
        console.log("Proposal completed", proposalId);
    } catch (error) {
        console.error("Error occurred while updating proposal", error);
    }
}